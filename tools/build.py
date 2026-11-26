#!/usr/bin/env python3
"""Assemble the static pages of www.vvcrealinfra.com.

Each page is `partials/head.html` + `partials/body-<page>.html` + `partials/foot.html`.
Edit the partials, run `python3 tools/build.py`, and commit the regenerated *.html
files at the repository root. No dependencies beyond the standard library.
"""

import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "tools" / "partials"

NAV_KEYS = ["HOME", "ABOUT", "CAP", "PROJ", "EXEC", "CLIENT", "CONTACT"]

PAGES = [
    ("index", "HOME",
     "VVC Realinfra Pvt Ltd | Roads, Buildings &amp; Infrastructure in Madhya Pradesh",
     "CRISIL BBB+ rated infrastructure company from Madhya Pradesh. Over Rs. 1,300 crore executed in five financial years across highways, mass housing, green buildings, auditoriums and smart parking."),
    ("about", "ABOUT",
     "About Us | VVC Realinfra Pvt Ltd",
     "VVC Realinfra Private Limited, formerly V.V. Construction, was founded in 2006 and incorporated in 2013. Our journey, leadership, people and vision."),
    ("capabilities", "CAP",
     "Capabilities | VVC Realinfra Pvt Ltd",
     "Roads and highways, mass housing, green buildings, auditoriums, multi-level parking and industrial structural works delivered by VVC Realinfra."),
    ("projects", "PROJ",
     "Projects Completed | VVC Realinfra Pvt Ltd",
     "69 works worth over Rs. 2,338 crore completed by VVC Realinfra across roads, infrastructure, irrigation, buildings, industrial and specialised works."),
    ("projects-under-execution", "EXEC",
     "Projects Under Execution | VVC Realinfra Pvt Ltd",
     "20 works worth over Rs. 1,154 crore under execution by VVC Realinfra, with a further Rs. 233 crore where the company is L1 and the award is awaited."),
    ("clients", "CLIENT",
     "Clients &amp; Partners | VVC Realinfra Pvt Ltd",
     "VVC Realinfra works with MPRDC, MPPWD, GAIL, NBCC, BDA, CPWD and other government bodies, and sub-contracts for L&amp;T, JMC Projects and Sobha Ltd."),
    ("contact", "CONTACT",
     "Contact | VVC Realinfra Pvt Ltd",
     "Contact VVC Realinfra Pvt Ltd at our registered office in Raghogarh, Dist. Guna and corporate offices in Indore and Bhopal."),
]


def build():
    head = (PARTIALS / "head.html").read_text()
    foot = (PARTIALS / "foot.html").read_text()

    for name, nav, title, desc in PAGES:
        path = "" if name == "index" else name + ".html"
        page = head.replace("__TITLE__", title)
        page = page.replace("__DESC__", desc)
        page = page.replace("__PATH__", path)
        for key in NAV_KEYS:
            page = page.replace("__NAV_%s__" % key,
                                ' aria-current="page"' if key == nav else "")
        page += (PARTIALS / ("body-%s.html" % name)).read_text()
        page += foot

        target = ROOT / (name + ".html")
        target.write_text(page)
        print("built %-18s %6d bytes" % (target.name, target.stat().st_size))


if __name__ == "__main__":
    build()
