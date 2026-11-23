"""Browser smoke test for FINOVA features 81-130 (demo/mock mode).
Run:  npm run build && npx vite preview --port 4173 &  python3 tests/smoke.py
All field lookups are scoped to <main> and use labels/aria-labels, so the header
'Search transactions…' box can never be matched by mistake.
"""
import json,sys,re
from playwright.sync_api import sync_playwright,expect
import os
BASE=os.environ.get('BASE','http://localhost:4173')
USER=json.dumps({'name':'Aarav Patel','email':'demo@finova.com'})
results=[];errors=[]
def step(name):
    def deco(fn):
        before=len(errors)
        try: fn(); ok=len(errors)==before; note='' if ok else 'console errors: '+'; '.join(errors[before:])[:200]
        except Exception as e: ok=False; note=' '.join(str(e).split())[:420]
        results.append((name,ok,note)); print(('PASS ' if ok else 'FAIL ')+name+('' if ok else ' -> '+note)); return fn
    return deco
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900})
    ctx.add_init_script(f"sessionStorage.setItem('fv_token','t');sessionStorage.setItem('fv_user',{json.dumps(USER)});")
    pg=ctx.new_page(); pg.set_default_timeout(8000)
    pg.on('pageerror',lambda e:errors.append('pageerror '+str(e)))
    pg.on('console',lambda m:errors.append('console '+m.text) if m.type=='error' and 'ERR_NAME_NOT_RESOLVED' not in m.text else None)  # offline CI: external fonts can't load
    M=lambda:pg.locator('main')
    def go(path): pg.goto(BASE+path); pg.wait_for_load_state('networkidle')
    def field(label): return M().get_by_label(label,exact=True)

    # ── Module A: transfers & beneficiaries ──
    @step('81 /transfers dashboard')
    def _():
        go('/transfers'); expect(M().get_by_role('heading',name='Money Transfers')).to_be_visible()
        expect(M().get_by_text('Recent transfers')).to_be_visible(); expect(M().get_by_text('Transfer limits')).to_be_visible()
    @step('82/87 own-account transfer: same account blocked, review, confirm')
    def _():
        go('/transfers/new?mode=own'); field('To account').select_option('a1'); field('Amount').fill('1000'); M().get_by_role('button',name='Review transfer').click()
        expect(M().get_by_text('Source and destination accounts must be different')).to_be_visible()
        field('To account').select_option('a2'); M().get_by_role('button',name='Review transfer').click()
        expect(M().get_by_text('Total debit',exact=True)).to_be_visible(); M().get_by_role('button',name='Confirm and send').click()
        expect(M().get_by_role('heading',name='Transfer completed')).to_be_visible()
    @step('86 beneficiary transfer: validation (over balance) then success')
    def _():
        go('/transfers/new?beneficiaryId=b1'); field('Amount').fill('99999999'); M().get_by_role('button',name='Review transfer').click()
        expect(M().get_by_text(re.compile('exceeds available balance'))).to_be_visible()
        field('Amount').fill('1500'); field('Description (optional)').fill('smoke'); M().get_by_role('button',name='Review transfer').click()
        M().get_by_role('button',name='Confirm and send').click(); expect(M().get_by_role('heading',name='Transfer completed')).to_be_visible()
    @step('88 large transfer stays PENDING (never shown as success)')
    def _():
        go('/transfers/new?beneficiaryId=b2'); field('Amount').fill('120000'); M().get_by_role('button',name='Review transfer').click()
        M().get_by_role('button',name='Confirm and send').click()
        expect(M().get_by_role('heading',name=re.compile('awaiting confirmation'))).to_be_visible(); expect(M().get_by_text('Transfer completed')).to_have_count(0)
        M().get_by_role('link',name='View status & receipt').click(); expect(M().get_by_text(re.compile('Awaiting bank confirmation'))).to_be_visible()
    @step('88 failed transfer shows failure reason')
    def _(): go('/transfers/TXN900105'); expect(M().get_by_text('The beneficiary bank rejected the transaction.')).to_be_visible()
    @step('89 receipt: unavailable fields labelled, print/download present')
    def _():
        go('/transfers/TXN900101'); expect(M().get_by_label('Transfer receipt')).to_be_visible(); expect(M().get_by_text('UTR2610080001')).to_be_visible()
        expect(M().get_by_role('button',name='Download')).to_be_visible(); expect(M().get_by_role('button',name='Print')).to_be_visible()
        go('/transfers/TXN900104'); expect(M().get_by_text('Not available').first).to_be_visible()
    @step('90 history: search, status filter, clear, mobile cards')
    def _():
        go('/transfers/history'); field('Search transfers').fill('Rohan'); expect(M().locator('tbody tr').first).to_contain_text('Rohan')
        field('Search transfers').fill(''); field('Status').select_option('failed'); expect(M().locator('tbody tr')).to_have_count(1)
        M().get_by_role('button',name='Clear filters').click(); expect(M().locator('tbody tr').first).to_be_visible()
        pg.set_viewport_size({'width':390,'height':800}); expect(M().locator('table')).to_be_hidden(); expect(M().locator('a.block.rounded-2xl').first).to_be_visible(); pg.set_viewport_size({'width':1280,'height':900})
    @step('83 beneficiaries list, search, empty search state')
    def _():
        go('/beneficiaries'); field('Search beneficiaries').fill('Priya'); expect(M().get_by_text('Priya Shah')).to_be_visible()
        field('Search beneficiaries').fill('zzz'); expect(M().get_by_text('No beneficiaries match your search')).to_be_visible()
    @step('84 add beneficiary: validation, duplicate, success → pending')
    def _():
        go('/beneficiaries/new'); M().get_by_role('button',name='Add beneficiary').click(); expect(M().get_by_text('Account number must be 9–18 digits')).to_be_visible()
        field('Beneficiary name').fill('Dup Test'); field('Bank account number').fill('60200112233'); field('Confirm account number').fill('60200112233'); field('IFSC code').fill('HDFC0001234'); field('Bank name').fill('HDFC Bank')
        M().get_by_role('button',name='Add beneficiary').click(); expect(M().get_by_text(re.compile('already exists'))).to_be_visible()
        field('Bank account number').fill('55550001111'); field('Confirm account number').fill('55550001112'); M().get_by_role('button',name='Add beneficiary').click(); expect(M().get_by_text('Account numbers do not match')).to_be_visible()
        field('Confirm account number').fill('55550001111'); M().get_by_role('button',name='Add beneficiary').click()
        expect(M().get_by_text('Verification pending',exact=True)).to_be_visible(); expect(M().get_by_text('Send money')).to_have_count(0)
    @step('85 verification → activation → active, then transfer allowed')
    def _():
        M().get_by_role('button',name='Check status').click(); expect(M().get_by_text(re.compile('confirmed the account details'))).to_be_visible()
        M().get_by_role('button',name='Request activation').click(); expect(M().get_by_text(re.compile('Activation has been requested'))).to_be_visible()
        M().get_by_role('button',name='Check status').click(); expect(M().get_by_text(re.compile('This beneficiary is active'))).to_be_visible(); expect(M().get_by_role('link',name='Send money')).to_be_visible()
    @step('85 verification FAILED state')
    def _():
        go('/beneficiaries/new'); field('Beneficiary name').fill('Fail Case'); field('Bank account number').fill('77770000000'); field('Confirm account number').fill('77770000000'); field('IFSC code').fill('ICIC0001111'); field('Bank name').fill('ICICI'); M().get_by_role('button',name='Add beneficiary').click()
        M().get_by_role('button',name='Check status').click(); expect(M().get_by_text('Verification failed',exact=True)).to_be_visible(); expect(M().get_by_role('button',name='Retry verification')).to_be_visible()
    @step('83 remove beneficiary requires confirmation')
    def _():
        M().get_by_role('link',name='Beneficiaries').click()  # in-app nav: page.goto would reset the in-memory demo state
        M().get_by_role('button',name='Remove Fail Case').click(); expect(pg.get_by_role('dialog')).to_be_visible(); pg.get_by_role('dialog').get_by_role('button',name='Remove').click(); expect(M().get_by_text('Fail Case')).to_have_count(0)
    # ── Module B: AI ──
    def ask(t):
        pg.get_by_label('Message',exact=True).fill(t); pg.get_by_role('button',name='Send').click()
    @step('91/92/97 AI: balance + last transactions render structured blocks')
    def _():
        go('/ai-agent'); ask('What is my available balance?'); expect(M().get_by_text('Here are your current balances')).to_be_visible()
        ask('Show my last five transactions'); expect(M().get_by_text('Figures come from your banking data.').nth(1)).to_be_visible()
    @step('93 AI search by amount')
    def _(): ask('Show transactions above ₹5,000'); expect(M().get_by_text(re.compile('Found \\d+ transaction'))).to_be_visible()
    @step('94/95 AI spending + summary')
    def _(): ask('How much did I spend this month?'); expect(M().get_by_text('Total spending').first).to_be_visible(); ask('Summarize my spending'); expect(M().get_by_text('Net cash flow').first).to_be_visible()
    @step('96 suggested prompt submits')
    def _(): pg.get_by_role('button',name='Show my largest expenses').click(); expect(M().get_by_text('Largest expenses, last 30 days')).to_be_visible()
    @step('99 AI transfer is only a preview (no money moved)')
    def _():
        ask('transfer 5000 to Rohan'); expect(M().get_by_text('Proposed action · not executed').last).to_be_visible(); expect(M().get_by_text(re.compile('I cannot send money from chat')).last).to_be_visible()
    @step('100 AI errors: rate limit w/ retry, permission denied, unsupported')
    def _():
        ask('hello #rate'); expect(M().get_by_text('Slow down for a moment')).to_be_visible(); expect(M().get_by_role('button',name='Retry')).to_be_visible()
        ask('x #denied'); expect(M().get_by_text('Permission denied')).to_be_visible(); expect(M().get_by_role('button',name='Retry')).to_have_count(0)
        ask('write me a poem'); expect(M().get_by_text('I cannot help with that yet')).to_be_visible()
    @step('98 AI conversation history: list, rename, delete w/ confirm')
    def _():
        aside=pg.get_by_label('Conversation history'); expect(aside.locator('button[aria-label^="Rename"]').first).to_be_visible()
        aside.locator('button[aria-label^="Rename"]').first.click(); pg.get_by_label('Conversation title').fill('Renamed chat'); pg.get_by_role('button',name='Save').click(); expect(aside.get_by_text('Renamed chat')).to_be_visible()
        aside.locator('button[aria-label^="Delete Renamed"]').click(); pg.get_by_role('dialog').get_by_role('button',name='Delete').click(); expect(aside.get_by_text('Renamed chat')).to_have_count(0)
    # ── Module C: fraud ──
    @step('101/102/109 fraud dashboard, filters')
    def _():
        go('/fraud-alerts'); expect(M().get_by_text('Total alerts')).to_be_visible(); expect(M().get_by_text('does not mean every transaction is checked in real time')).to_be_visible()
        field('Risk level').select_option('high'); expect(M().get_by_text('QuickCash Ventures')).to_be_visible(); expect(M().get_by_text('GlobalMart Online')).to_have_count(0)
        field('Risk level').select_option(''); field('Search alerts').fill('zzzz'); expect(M().get_by_text('No alerts match your filters')).to_be_visible()
    @step('103/104/105/108 alert detail: observed vs model, score label, guidance')
    def _():
        go('/fraud-alerts/f1'); expect(M().get_by_text('What we observed')).to_be_visible(); expect(M().get_by_text('Model interpretation')).to_be_visible(); expect(M().get_by_text('not a probability that fraud occurred',exact=False)).to_be_visible()
        expect(M().get_by_text('Security recommendations')).to_be_visible(); expect(M().get_by_text(re.compile('card-lock'))).to_have_count(0)
    @step('106/107 report flow requires confirmation, returns case ref, status → under review')
    def _():
        M().get_by_role('button',name='I don’t recognise this').click(); sub=pg.get_by_role('button',name='Submit report'); expect(sub).to_be_disabled()
        pg.get_by_role('checkbox').check(); sub.click(); expect(pg.get_by_text(re.compile('CASE-\\d+')).first).to_be_visible(); pg.get_by_role('button',name='Done').click(); expect(M().get_by_text('under review').first).to_be_visible()
    @step('105 unknown alert id → not found (ownership)')
    def _(): go('/fraud-alerts/nope'); expect(M().get_by_text('This alert was not found.')).to_be_visible()
    @step('110 notifications: badge, page, mark read')
    def _():
        go('/notifications'); expect(M().get_by_text('Transaction flagged for review').first).to_be_visible(); expect(pg.get_by_label(re.compile('unread notifications'))).to_be_visible()
        M().get_by_role('button',name='Mark all read').click(); expect(pg.get_by_label(re.compile('unread notifications'))).to_have_count(0)
    # ── Module D: insights ──
    @step('111/113/115/116/119 insights dashboard')
    def _():
        go('/analytics/insights'); expect(M().get_by_text('Spending trend')).to_be_visible(); expect(M().get_by_text('Income vs expenses')).to_be_visible(); expect(M().get_by_text('Month-over-month')).to_be_visible(); expect(M().get_by_role('heading',name='Recommendations')).to_be_visible()
        expect(M().get_by_text(re.compile('month not finished'))).to_be_visible(); M().get_by_role('button',name='Weekly').click(); expect(M().locator('svg.recharts-surface').first).to_be_visible()
        field('Account').select_option('a2'); expect(M().get_by_text('Spending trend')).to_be_visible()
    @step('112/114 category analysis + manual category edit saves')
    def _():
        go('/analytics/categories?c=Food'); expect(M().get_by_text('Largest transactions')).to_be_visible(); expect(M().get_by_role('link',name='Open in Transactions')).to_be_visible()
        sel=M().locator('tbody select').first; sel.select_option('Other'); expect(pg.get_by_text('Category saved')).to_be_visible()
    @step('117/118 budgets: create, duplicate error, alerts, delete')
    def _():
        go('/analytics/budgets'); expect(M().get_by_text('Status rules')).to_be_visible(); M().get_by_role('button',name='New budget').click(); d=pg.get_by_role('dialog')
        d.get_by_label('Budget name').fill('Travel cap'); d.get_by_label('Category').select_option('Travel'); d.get_by_label('Monthly amount (₹)').fill('3000'); d.get_by_role('button',name='Create budget').click(); expect(M().get_by_text('Travel cap',exact=True)).to_be_visible()
        M().get_by_role('button',name='New budget').click(); d=pg.get_by_role('dialog'); d.get_by_label('Budget name').fill('Again'); d.get_by_label('Category').select_option('Travel'); d.get_by_label('Monthly amount (₹)').fill('100'); d.get_by_role('button',name='Create budget').click(); expect(d.get_by_text(re.compile('already exists'))).to_be_visible(); pg.keyboard.press('Escape')
        M().get_by_role('button',name='Delete Travel cap').click(); pg.get_by_role('dialog').get_by_role('button',name='Delete').click(); expect(M().get_by_text('Travel cap',exact=True)).to_have_count(0)
    @step('120 insight history + dismiss; save gated off')
    def _():
        go('/analytics/history'); expect(M().get_by_text('Saving insights is not available yet.')).to_be_visible(); expect(M().get_by_role('button',name='Save',exact=True)).to_have_count(0); n=M().get_by_text(re.compile('spending summary')).count(); M().get_by_role('button',name='Dismiss').first.click(); expect(M().get_by_text(re.compile('spending summary'))).to_have_count(n-1)
    # ── Module E: goals & forecast ──
    @step('121/123 goals dashboard with progress')
    def _(): go('/financial-goals'); expect(M().get_by_text('Total goals')).to_be_visible(); expect(M().get_by_role('progressbar').first).to_be_visible(); expect(M().get_by_text('does not move money into a separate account',exact=False)).to_be_visible()
    @step('122 create goal: validation then success')
    def _():
        go('/financial-goals/new'); M().get_by_role('button',name='Create goal').click(); expect(M().get_by_text('Enter a goal name')).to_be_visible()
        field('Goal name').fill('Course'); field('Target amount (₹)').fill('-5'); field('Target date').fill('2020-01-01'); M().get_by_role('button',name='Create goal').click(); expect(M().get_by_text('Target must be greater than zero')).to_be_visible(); expect(M().get_by_text('Target date must be in the future')).to_be_visible()
        field('Target amount (₹)').fill('50000'); field('Target date').fill('2027-06-30'); M().get_by_role('button',name='Create goal').click(); expect(M().get_by_role('heading',name='Course')).to_be_visible()
    @step('126 contribution recorded as planning record; progress updates')
    def _():
        expect(M().get_by_text('do not move money between bank accounts')).to_be_visible(); M().get_by_role('button',name='Record').click(); d=pg.get_by_role('dialog'); d.get_by_label('Amount (₹)').fill('5000'); d.get_by_role('button',name='Save contribution').click(); expect(M().get_by_text('10%',exact=False).first).to_be_visible()
    @step('124 savings plan estimate with assumptions')
    def _():
        go('/financial-goals/plan'); field('Goal amount (₹)').fill('60000'); field('Currently saved (₹)').fill('10000'); field('Target date').fill('2027-04-30'); M().get_by_role('button',name='Estimate plan').click()
        expect(M().get_by_text('Suggested monthly savings')).to_be_visible(); expect(M().get_by_text('Assumptions')).to_be_visible(); expect(M().get_by_text(re.compile('not a guarantee'))).to_be_visible()
    @step('125 monthly planner: edit + save')
    def _():
        go('/financial-goals/monthly'); expect(M().get_by_text('Remaining to allocate')).to_be_visible(); field('Planned savings (₹)').fill('20000'); M().get_by_role('button',name='Save plan').click(); expect(pg.get_by_text('Plan saved')).to_be_visible()
    @step('127/128/129/130 forecast: estimates labelled, scenario, upcoming, threshold')
    def _():
        go('/analytics/forecast'); expect(M().get_by_text('Estimated net cash flow')).to_be_visible(); expect(M().get_by_text(re.compile('not a probability|spread of past values'),).first).to_be_visible()
        expect(M().get_by_text('No scheduled payments or standing instructions are connected')).to_be_visible(); expect(M().get_by_text('Predicted from your history')).to_be_visible()
        M().get_by_role('button',name='12 mo').click(); expect(M().get_by_text('Forecast assumptions')).to_be_visible()
        M().get_by_label('Low-balance threshold ₹').fill('999999'); expect(M().get_by_text(re.compile('falls below'))).to_be_visible()
    @step('130 forecast summary: last updated, disclaimer, assumptions, links')
    def _():
        go('/analytics/forecast'); sm=M().get_by_label('Forecast summary'); expect(sm.get_by_text('Expected income')).to_be_visible(); expect(sm.get_by_text('Expected expenses')).to_be_visible(); expect(sm.get_by_text('Est. net cash flow')).to_be_visible()
        expect(sm.get_by_text(re.compile('Last updated'))).to_be_visible(); expect(sm.get_by_text('Forecast assumptions')).to_be_visible()
        expect(sm.get_by_text('Forecasts are estimates based on available historical and scheduled data',exact=False)).to_be_visible()
        for l in ['Transactions','Accounts','Budgets','Financial goals']: expect(sm.get_by_role('link',name=l)).to_be_visible()
        expect(sm.get_by_text(re.compile('No potential low-balance period'))).to_be_visible(); sm.get_by_label('Low-balance threshold ₹').fill('999999'); expect(sm.get_by_text(re.compile('Potential low-balance period'))).to_be_visible()
    # ── remaining-item checks ──
    @step('87 fee preview: fee + total shown when quoted; "no fee info" otherwise')
    def _():
        go('/transfers/new?beneficiaryId=b3'); field('Amount').fill('60000'); M().get_by_role('button',name='Review transfer').click()
        expect(M().get_by_text('Fee',exact=True)).to_be_visible(); expect(M().get_by_text('₹25',exact=True)).to_be_visible(); expect(M().get_by_text('₹60,025',exact=True)).to_be_visible(); expect(M().get_by_text('No fee information')).to_have_count(0)
        M().get_by_role('button',name='Confirm and send').click(); expect(M().get_by_role('heading',name='Transfer completed')).to_be_visible(); M().get_by_role('link',name='View status & receipt').click(); expect(M().get_by_text('Total debited')).to_be_visible()
        go('/transfers/new?beneficiaryId=b3'); field('Amount').fill('2000'); M().get_by_role('button',name='Review transfer').click(); expect(M().get_by_text('No fee information was returned by the bank')).to_be_visible()
    @step('89 receipt downloads a real PDF')
    def _():
        go('/transfers/TXN900101')
        with pg.expect_download() as dl: M().get_by_role('button',name='Download PDF').click()
        d=dl.value; assert d.suggested_filename.endswith('.pdf'),d.suggested_filename; path=d.path(); assert open(path,'rb').read(5)==b'%PDF-','not a PDF'
    @step('98 clear conversation: confirm, messages deleted, chat kept in history')
    def _():
        go('/ai-agent'); ask('What is my available balance?'); expect(M().get_by_text('Here are your current balances')).to_be_visible()
        pg.get_by_label('Clear conversation').click(); d=pg.get_by_role('dialog'); expect(d.get_by_text('Clear this conversation?')).to_be_visible(); d.get_by_role('button',name='Clear').click()
        expect(M().get_by_text('Here are your current balances')).to_have_count(0); expect(M().get_by_text('Hi! I can answer questions')).to_be_visible(); expect(pg.get_by_label('Conversation history').get_by_text('What is my available balance?')).to_be_visible()
    @step('111 savings trend chart with accessible summary')
    def _():
        go('/analytics/insights'); expect(M().get_by_role('heading',name='Savings trend')).to_be_visible(); expect(M().get_by_text('not your bank balance',exact=False)).to_be_visible()
        assert 'net' in M().locator('p.sr-only').first.inner_text(); assert M().locator('[role=img][aria-label^="Monthly net cash flow"]').count()==1
    @step('115 spending trend Bar/Line toggle')
    def _():
        M().get_by_role('button',name='Line',exact=True).click(); expect(M().locator('.recharts-line').first).to_be_visible(); expect(M().get_by_role('button',name='Line',exact=True)).to_have_attribute('aria-pressed','true')
        M().get_by_role('button',name='Bars',exact=True).click(); expect(M().locator('.recharts-bar').first).to_be_visible()
    @step('117 budgets: weekly + yearly periods, duplicate per period, edit locks category/period')
    def _():
        go('/analytics/budgets')
        def new(name,cat,per,amt):
            M().get_by_role('button',name='New budget').click(); d=pg.get_by_role('dialog'); d.get_by_label('Budget name').fill(name); d.get_by_label('Category').select_option(cat); d.get_by_label('Period').select_option(per); d.get_by_label(re.compile('amount')).fill(amt); d.get_by_role('button',name='Create budget').click(); return d
        new('Weekly food','Food','weekly','1500'); expect(M().get_by_text('Weekly food',exact=True)).to_be_visible(); expect(M().get_by_text(re.compile('weekly · Week of'))).to_be_visible()
        new('Yearly travel','Travel','yearly','50000'); expect(M().get_by_text(re.compile('yearly · 2026'))).to_be_visible()
        d=new('Dup weekly','Food','weekly','100'); expect(d.get_by_text(re.compile('weekly budget for Food already exists'))).to_be_visible(); pg.keyboard.press('Escape')
        M().get_by_role('button',name='Edit Food & dining').click(); d=pg.get_by_role('dialog'); expect(d.get_by_label('Category')).to_be_disabled(); expect(d.get_by_label('Period')).to_be_disabled()
        d.get_by_label(re.compile('amount')).fill('7000'); d.get_by_role('button',name='Save changes').click(); expect(M().get_by_text('₹7,000',exact=False).first).to_be_visible()
    @step('128 scenario sliders: baseline vs scenario table, estimates labelled')
    def _():
        go('/analytics/forecast'); expect(M().get_by_text('Move a slider above')).to_be_visible()
        M().get_by_label('Spending change percent').fill('-10'); M().get_by_label('Income change percent').fill('5')
        expect(M().get_by_text('spending -10%, income +5%',exact=False)).to_be_visible(); expect(M().get_by_text('Move a slider above')).to_have_count(0)
        row=M().locator('tr',has_text='Expenses').first; expect(row).to_contain_text('-₹'); expect(M().get_by_text('not predictions',exact=False)).to_be_visible()
        M().get_by_role('button',name='Reset to baseline').click(); expect(M().get_by_text('Move a slider above')).to_be_visible()
    # ── regression: legacy routes + landing page ──
    @step('legacy redirects (/transfer, /fraud-detection, /financial-insights, /goals, /analytics)')
    def _():
        for old,new in [('/transfer','/transfers/new'),('/fraud-detection','/fraud-alerts'),('/financial-insights','/analytics/insights'),('/goals','/financial-goals'),('/analytics','/analytics/insights'),('/beneficiaries?add=1','/beneficiaries/new')]:
            go(old); assert pg.url.endswith(new),f'{old} -> {pg.url}'
    @step('landing page and existing routes still load')
    def _():
        for r in ['/','/dashboard','/accounts','/transactions','/statements']:
            go(r); assert pg.locator('body').inner_text().strip(),r
    @step('mobile 390px: no horizontal overflow on key pages')
    def _():
        pg.set_viewport_size({'width':390,'height':800})
        for r in ['/transfers','/fraud-alerts','/analytics/insights','/financial-goals','/ai-agent','/analytics/forecast']:
            go(r); w=pg.evaluate('document.documentElement.scrollWidth'); assert w<=392,f'{r} scrollWidth={w}'
    b.close()
bad=[r for r in results if not r[1]]
print(f'\n{len(results)-len(bad)}/{len(results)} passed'); sys.exit(1 if bad else 0)
