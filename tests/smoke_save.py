"""Second pass: build with VITE_DEMO_INSIGHT_SAVE=true so /capabilities.insightSave is on (item 120)."""
import json,os,sys,re
from playwright.sync_api import sync_playwright,expect
BASE=os.environ.get('BASE','http://localhost:4174')
USER=json.dumps({'name':'Aarav Patel','email':'demo@finova.com'})
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1280,'height':900})
    ctx.add_init_script(f"sessionStorage.setItem('fv_token','t');sessionStorage.setItem('fv_user',{json.dumps(USER)});")
    pg=ctx.new_page();pg.set_default_timeout(8000);M=pg.locator('main');ok=True
    try:
        pg.goto(BASE+'/analytics/history');pg.wait_for_load_state('networkidle')
        expect(M.get_by_role('button',name='Save',exact=True).first).to_be_visible(); expect(M.get_by_text('Saving insights is not available yet.')).to_have_count(0)
        M.get_by_role('button',name='Save',exact=True).first.click(); expect(M.get_by_role('button',name='Saved',exact=True)).to_have_count(2)  # card button + filter tab
        M.get_by_role('button',name='Saved',exact=True).first.click() if False else None
        M.get_by_role('group',name='Filter').get_by_role('button',name='Saved').click(); expect(M.locator('article, .card').filter(has_text='spending summary')).to_have_count(1)
        M.get_by_role('group',name='Filter').get_by_role('button',name='All').click(); expect(M.get_by_role('button',name='Save',exact=True).first).to_be_visible()
        print('PASS 120 save insights (capability on): save, Saved filter, all')
    except Exception as e:
        ok=False;print('FAIL 120 save insights ->',' '.join(str(e).split())[:400])
    b.close();sys.exit(0 if ok else 1)
