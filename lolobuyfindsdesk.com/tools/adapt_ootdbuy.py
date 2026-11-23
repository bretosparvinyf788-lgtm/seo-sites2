import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "worker" / "template.js"
CONTENT = ROOT / "tools" / "content.json"
FEATURED = ROOT / "tools" / "featured.json"


def adapt_template() -> None:
    source = TEMPLATE.read_text(encoding="utf-8")
    source = source.replace("const SIGNUP='https://ikako.vip/r/wtqaa';", "const SIGNUP='https://ootdbuy.com/register?inviteCode=PY4OUQ9A1';\nconst SITE_ORIGIN='https://ootdbuysheetdesk.com';")
    source = source.replace("KAKOBUY", "OOTDBUY").replace("Kakobuy", "OOTDBuy")
    source = source.replace("<span>kakobuy</span>", "<span>ootdbuy</span>")
    source = source.replace(">kakobuy</a>", ">ootdbuy</a>")
    source = source.replace('class="atlas-cover-mark" aria-hidden="true">K.</span>', 'class="atlas-cover-mark" aria-hidden="true">O.</span>')
    source = source.replace("7894400057", "7896594713")
    source = source.replace(
        "buy='https://item2.kakobuy.com/item/details?url='+encodeURIComponent('https://weidian.com/item.html?itemID='+p.id)+'&affcode=wtqaa'",
        "buy='https://ootdbuy.com/goods/details?id='+encodeURIComponent(p.id)+'&channel=weidian&inviteCode=endoren'",
    )
    old_catalog_link = '<a href="https://kakobuymake.com/" target="_blank" rel="noopener">${esc(t.spreadsheet)} <span class="arrow ne" aria-hidden="true"></span></a>'
    new_catalog_link = '<a href="${link(\'/finds\')}">${esc(t.spreadsheet)} <span class="arrow ne" aria-hidden="true"></span></a>'
    source = source.replace(old_catalog_link, new_catalog_link)
    source = source.replace('<a href="${link(\'/guide\')}">${esc(t.guide)}</a>', "")
    source = source.replace('<a href="${link(\'/guide\')}">${esc(t.guide)} <span class="arrow ne" aria-hidden="true"></span></a>', "")
    source = source.replace('<a class="detail-guide" href="${link(\'/guide\')}">${esc(t.how)} <span class="arrow ne" aria-hidden="true"></span></a>', "")
    source = re.sub(r'<section class="atlas-guide wrap">.*?</section>', "", source)
    source = re.sub(r'function guide\(c\)\{.*?\}\nfunction imageFromBase64', 'function imageFromBase64', source, flags=re.S)
    source = source.replace("const canonical=new URL(u.pathname,u.origin)", "const canonical=new URL(u.pathname,SITE_ORIGIN)")
    source = source.replace("href=\"${u.origin+u.pathname+", "href=\"${SITE_ORIGIN+u.pathname+")
    source = source.replace("href=\"${u.origin+u.pathname}\"", "href=\"${SITE_ORIGIN+u.pathname}\"")
    source = source.replace(
        "${extra}</head>",
        "${extra}<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-SN1WS560YB\"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-SN1WS560YB');</script></head>",
    )
    source = source.replace("'Sitemap: '+u.origin+'/sitemap.xml'", "'Sitemap: '+SITE_ORIGIN+'/sitemap.xml'")
    source = source.replace("'Sitemap: '+u.origin+'/sitemap.xml", "'Sitemap: '+SITE_ORIGIN+'/sitemap.xml")
    source = source.replace("Sitemap: '+u.origin+'/sitemap.xml", "Sitemap: '+SITE_ORIGIN+'/sitemap.xml")
    source = source.replace("['/','/finds','/guide',", "['/','/finds',")
    source = source.replace("`<url><loc>${u.origin+p}</loc></url>`", "`<url><loc>${SITE_ORIGIN+p}</loc></url>`")
    source = source.replace("else if(u.pathname==='/guide')html=guide(c);", "")
    source = source.replace("if(!known&&p.id){", "if(p.id&&(!known||aid==='7896594713')){")
    TEMPLATE.write_text(source, encoding="utf-8")


def replace_strings(value):
    if isinstance(value, dict):
        return {key: replace_strings(item) for key, item in value.items()}
    if isinstance(value, list):
        return [replace_strings(item) for item in value]
    if isinstance(value, str):
        return (
            value.replace("Kakobuy", "OOTDBuy")
            .replace("KAKOBUY", "OOTDBUY")
            .replace("kakobuymake.com", "ootdbuysheetdesk.com/finds")
            .replace("7894400057", "7896594713")
        )
    return value


def adapt_json() -> None:
    content = json.loads(CONTENT.read_text(encoding="utf-8"))
    CONTENT.write_text(json.dumps(replace_strings(content), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    featured = json.loads(FEATURED.read_text(encoding="utf-8"))
    sample = featured["sample"]
    sample.update(
        {
            "aid": "7896594713",
            "id": "7896594713",
            "title": "Weidian listing 7896594713",
            "sourceName": "Weidian listing 7896594713",
            "nameEn": "Featured Weidian find 7896594713",
            "gallery": [],
            "price": None,
            "cny": None,
        }
    )
    FEATURED.write_text(json.dumps(featured, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    adapt_template()
    adapt_json()
