import json, csv, re, collections
wiki=[r for r in json.load(open('wiki_ge.json')) if r[0]]
names={r['name_en']:r['code'] for r in csv.DictReader(open('/tmp/vrd/data/countries.csv'))}
alias={"Antigua and Barbuda":"Antigua & Barbuda","Bosnia and Herzegovina":"Bosnia & Herzegovina","Saint Kitts and Nevis":"St. Kitts & Nevis","Saint Lucia":"St. Lucia","Saint Vincent and the Grenadines":"St. Vincent & Grenadines","São Tomé and Príncipe":"São Tomé & Príncipe","Trinidad and Tobago":"Trinidad & Tobago","Turkey":"Türkiye","Czech Republic":"Czechia","Côte d'Ivoire":"Côte d’Ivoire","Republic of the Congo":"Congo","Democratic Republic of the Congo":"DR Congo","Cape Verde":"Cabo Verde","Micronesia":"Micronesia","North Korea":"North Korea","South Korea":"South Korea","Vatican City":"Vatican City","Timor-Leste":"Timor-Leste","Eswatini":"Eswatini","Bahamas":"Bahamas","Gambia":"Gambia"}
def code(n):
    if n in names: return names[n]
    a=alias.get(n)
    if a and a in names: return names[a]
    for k,v in names.items():
        if n.lower() in k.lower() or k.lower() in n.lower(): return v
    return None
def cats(t):
    t=t.lower()
    if t.startswith('visa not required'): return {'visa_free'}
    if t=='visa required': return {'visa_required'}
    s=set()
    if 'evisa' in t or 'online visa' in t: s.add('evisa')
    if 'on arrival' in t: s.add('visa_on_arrival')
    if any(k in t for k in ['electronic travel','eta-il','electronic border','easy visitor']): s|={'eta','evisa'}
    return s
def days(s):
    s=s.lower(); m=re.match(r'(?:up to )?(\d+) (day|month|week)',s)
    if not m: return None
    n=int(m.group(1)); return n*{'day':1,'month':30,'week':7}[m.group(2)]
base={r['destination']:r for r in csv.DictReader(open('/tmp/vrd/data/visa-requirements.csv')) if r['passport']=='GE'}
unmapped=[];res=collections.Counter();req_dis=[];stay_dis=[]
for n,req,stay in wiki:
    c=code(n)
    if not c or c not in base: unmapped.append(n); continue
    b=base[c]; w=cats(req)
    if b['requirement'] in w: res['requirement agrees']+=1
    else: res['requirement disagrees']+=1; req_dis.append((c,n,b['requirement'],b['max_stay_days'],req,stay))
    wd=days(stay); bd=int(b['max_stay_days']) if b['max_stay_days'] else None
    if wd and bd and abs(wd-bd)>2 and b['requirement'] in w: stay_dis.append((c,n,bd,stay))
covered={code(n) for n,_,_ in wiki}
missing=[c for c in base if c not in covered]
print(dict(res)); print('unmapped',unmapped); print('base dests not in wiki table',missing)
print('\nREQUIREMENT DISAGREEMENTS', len(req_dis))
for r in req_dis: print(' ',r)
print('\nSTAY DISAGREEMENTS (requirement agrees)', len(stay_dis))
for r in stay_dis: print(' ',r)
json.dump({'req':req_dis,'stay':stay_dis,'counts':res,'missing':missing},open('result.json','w'),ensure_ascii=False)
