"""Generate original modern SVG scenes; use a new ID when revising an asset."""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'src/modules/quizzes/media/assets'
INK = '#304563'
BLUE = '#5b88e5'
CORAL = '#ef7384'
RED = '#e65b53'
YELLOW = '#f4c75c'
MINT = '#79b999'
PURPLE = '#a48bd2'


def ellipse(x,y,rx,ry,color,opacity=1):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{color}" opacity="{opacity}"/>'


def circle(x,y,r,color,stroke='none',width=2):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}" stroke="{stroke}" stroke-width="{width}"/>'


def rect(x,y,w,h,color,radius=12,stroke='none'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{color}" stroke="{stroke}" stroke-width="2"/>'


def line(x1,y1,x2,y2,color=INK,width=6):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'


def path(d,color,stroke='none',width=3):
    return f'<path d="{d}" fill="{color}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'


def shadow(x,y,rx=60,ry=9):
    return ellipse(x,y,rx,ry,'#354664',.10)


def person(x,y,shirt=BLUE,pose='stand',scale=1,sad=False,skin='#dca37e',hair='#53465c'):
    limbs = ''
    if pose == 'sit':
        limbs += path('M -13 13 L -40 28 L -18 48 M 13 13 L 43 29 L 24 48','none',INK,15)
    elif pose == 'balance':
        limbs += path('M -13 12 L -4 54 M 12 12 L 25 47','none',INK,15)
    else:
        limbs += path('M -13 12 L -20 53 M 13 12 L 20 53','none',INK,15)
    if pose == 'up':
        limbs += path('M -21 -33 Q -34 -51 -44 -87 M 21 -33 Q 34 -51 44 -87','none',skin,15)
    elif pose == 'balance':
        limbs += path('M -21 -32 L -70 -26 M 21 -32 L 70 -26','none',skin,15)
    elif pose == 'reach':
        limbs += path('M -21 -34 L -35 -1 M 21 -34 L 54 -2','none',skin,15)
    else:
        limbs += path('M -21 -33 Q -32 -17 -35 0 M 21 -33 Q 32 -17 35 0','none',skin,15)
    body = path('M -18 -50 Q 0 -57 18 -50 Q 29 -37 25 -5 L 23 15 Q 0 24 -23 15 L -25 -5 Q -29 -37 -18 -50 Z',shirt)
    body += path('M 12 -49 Q 29 -29 23 15 L 13 18 Q 18 -11 12 -49 Z','#263d70',width=0).replace('fill="#263d70"','fill="#263d70" opacity="0.12"')
    body += rect(-13,-24,18,14,'#ffffff',5).replace('fill="#ffffff"','fill="#ffffff" opacity="0.34"')
    head = circle(0,-78,27,skin)
    head += path('M -27 -78 Q -30 -110 2 -108 Q 31 -107 28 -77 Q 18 -93 6 -93 Q -8 -84 -20 -93 Z',hair)
    head += circle(-10,-78,2.8,INK)+circle(10,-78,2.8,INK)
    head += circle(-15,-67,4,'#e87c80')+circle(15,-67,4,'#e87c80')
    head += path('M -8 -61 Q 0 '+('-70' if sad else '-53')+' 8 -61','none',INK,2.6)
    if sad: head += path('M -16 -88 L -6 -92 M 6 -92 L 16 -88','none',INK,2.5)
    else: head += path('M -15 -89 Q -10 -92 -5 -89 M 5 -89 Q 10 -92 15 -89','none',hair,2)
    shoes = path('M -26 49 Q -20 44 -12 50 L -10 58 L -32 58 Z',BLUE)+path('M 14 49 Q 21 44 29 50 L 34 58 L 10 58 Z',BLUE) if pose != 'sit' else ''
    return f'<g transform="translate({x} {y}) scale({scale})">{limbs}{body}{head}{shoes}</g>'


def ball(x,y,r=48,color=BLUE):
    return circle(x,y,r,color)+path(f'M {x-r*.53} {y-r*.42} Q {x-r*.25} {y-r*.76} {x+r*.12} {y-r*.65}','none','#ffffff',5)+path(f'M {x+r*.56} {y-r*.3} Q {x+r*.73} {y+r*.26} {x+r*.27} {y+r*.68}','none','#304b81',4).replace('stroke="#304b81"','stroke="#304b81" opacity="0.2"')


def block(x,y,w,h,color):
    return rect(x,y,w,h,color,12)+rect(x+7,y+7,w-14,8,'#ffffff',4).replace('fill="#ffffff"','fill="#ffffff" opacity="0.25"')+path(f'M {x+w-13} {y+19} L {x+w-13} {y+h-12} L {x+14} {y+h-12}','none',INK,3).replace(f'stroke="{INK}"',f'stroke="{INK}" opacity="0.12"')


def car(x,y,color):
    return shadow(x,y+39,76,9)+path(f'M {x-60} {y-19} L {x-32} {y-57} Q {x-24} {y-67} {x-11} {y-67} L {x+22} {y-67} Q {x+31} {y-64} {x+41} {y-50} L {x+61} {y-17} Z',color)+rect(x-77,y-26,154,56,color,17)+path(f'M {x-34} {y-31} L {x-13} {y-57} L {x+20} {y-57} L {x+39} {y-31} Z','#e4f3fb')+line(x+4,y-55,x+4,y-32,'#8cadc9',3)+rect(x-66,y-15,19,7,'#ffffff',3)+rect(x+58,y-7,10,10,YELLOW,3)+circle(x-47,y+28,22,INK)+circle(x+47,y+28,22,INK)+circle(x-47,y+28,10,'#c5d6eb')+circle(x+47,y+28,10,'#c5d6eb')


def apple(x,y):
    return path(f'M {x} {y-16} C {x-40} {y-36} {x-37} {y+34} {x} {y+27} C {x+37} {y+34} {x+40} {y-36} {x} {y-16} Z',RED)+line(x,y-18,x+3,y-34,'#84634e',4)+path(f'M {x+2} {y-27} Q {x+17} {y-44} {x+29} {y-31} Q {x+19} {y-21} {x+2} {y-27} Z',MINT)+path(f'M {x-17} {y-6} Q {x-23} {y+3} {x-17} {y+12}','none','#ffe5dc',4)


def cat(x,y):
    body=path(f'M {x-46} {y-5} L {x-47} {y-54} Q {x-46} {y-65} {x-36} {y-57} L {x-16} {y-36} Q {x} {y-42} {x+16} {y-36} L {x+38} {y-57} Q {x+47} {y-65} {x+47} {y-52} L {x+46} {y-5} Q {x+46} {y+43} {x} {y+43} Q {x-46} {y+43} {x-46} {y-5} Z','#dfa773')
    body+=path(f'M {x-38} {y-50} L {x-36} {y-28} L {x-21} {y-35} Z','#f5c3b3')+path(f'M {x+38} {y-50} L {x+36} {y-28} L {x+21} {y-35} Z','#f5c3b3')
    body+=circle(x-17,y,3.2,INK)+circle(x+17,y,3.2,INK)+path(f'M {x-6} {y+14} Q {x} {y+8} {x+6} {y+14} L {x} {y+21} Z',CORAL)+path(f'M {x} {y+20} Q {x-8} {y+28} {x-14} {y+21} M {x} {y+20} Q {x+8} {y+28} {x+14} {y+21}','none',INK,2)
    return body+line(x-26,y+15,x-52,y+11,'#9f764e',2)+line(x+26,y+15,x+52,y+11,'#9f764e',2)


def rabbit(x,y):
    return ellipse(x-19,y-59,14,42,'#dedbec')+ellipse(x+19,y-59,14,42,'#dedbec')+ellipse(x-19,y-59,7,30,'#efb9c3')+ellipse(x+19,y-59,7,30,'#efb9c3')+circle(x,y,47,'#dedbec')+circle(x-17,y,3,INK)+circle(x+17,y,3,INK)+ellipse(x,y+13,6,4,CORAL)+path(f'M {x} {y+16} L {x} {y+23} M {x-9} {y+24} Q {x} {y+29} {x+9} {y+24}','none',INK,2)


def turtle(x,y):
    return ellipse(x,y,54,36,MINT)+ellipse(x+66,y+1,21,19,'#a3d0aa')+circle(x+73,y-3,2.5,INK)+path(f'M {x+68} {y+10} Q {x+75} {y+15} {x+81} {y+9}','none',INK,2)+line(x-33,y+26,x-39,y+42,MINT,13)+line(x+27,y+26,x+32,y+42,MINT,13)+path(f'M {x-22} {y-18} L {x+15} {y-18} L {x+29} {y+8} L {x} {y+23} L {x-32} {y+8} Z','none','#4b8a73',3)


def duck(x,y):
    return ellipse(x,y+18,44,29,YELLOW)+circle(x+23,y-16,23,YELLOW)+path(f'M {x+42} {y-21} L {x+66} {y-11} Q {x+55} {y-2} {x+42} {y-6} Z','#ee9568')+circle(x+28,y-20,3,INK)+path(f'M {x-25} {y+15} Q {x-3} {y+35} {x+11} {y+13}','none','#d3a547',3)


def house(x,y):
    return rect(x-43,y-12,86,80,'#f0d6b1',6)+path(f'M {x-58} {y-9} L {x} {y-61} L {x+58} {y-9} Z',CORAL)+rect(x-10,y+28,25,40,BLUE,7)+rect(x-30,y+7,17,18,'#f7fbfe',3)


def panel(x,w=178):
    return rect(x,32,w,286,'#f4ede1',22)+rect(x+3,29,w,283,'#fffdf7',22)


def scenes():
    return {
      'contar-um':rect(97,244,446,61,'#ece0c8',24)+line(121,287,519,287,'#d2c5ac',3)+shadow(320,249,59,9)+ball(320,191,58),
      'contar-dois':rect(61,247,518,41,'#dce6ef',20)+car(194,224,RED)+car(448,224,YELLOW),
      'contar-tres':rect(73,258,494,20,'#b69379',8)+line(103,279,103,324,'#9d7f6a',14)+line(537,279,537,324,'#9d7f6a',14)+block(134,162,91,96,BLUE)+block(273,162,91,96,RED)+block(412,162,91,96,YELLOW),
      'cor-vermelha':''.join(shadow(x,309,35,5)+ellipse(x,143,48,65,c)+path(f'M {x-23} 104 Q {x-30} 118 {x-29} 137','none','#fffaf4',5)+path(f'M {x-6} 202 L {x+6} 202 L {x} 214 Z',c)+path(f'M {x} 214 Q {x-10} 240 {x+2} 266 Q {x+10} 286 {x} 307','none','#b7b6c1',2) for x,c in [(159,BLUE),(320,RED),(481,YELLOW)]),
      'forma-circulo':circle(320,178,99,'#76b392')+path('M 258 120 Q 291 94 322 94','none','#a8d0b8',5),
      'forma-quadrado':rect(223,81,194,194,PURPLE,0)+path('M 239 257 L 239 97 L 402 97','none','#c7b8e2',4),
      'compartilhar':shadow(169,291,47,8)+shadow(473,291,47,8)+person(169,229,BLUE)+person(473,229,YELLOW,skin='#8e6251',hair='#3f3447')+''.join(block(x,y,43,42,c) for x,y,c in [(235,265,YELLOW),(284,265,CORAL),(333,265,MINT),(258,216,BLUE),(307,216,YELLOW)]),
      'pedir-ajuda':rect(90,304,460,20,'#e7dcc9',10)+person(229,247,PURPLE,sad=True)+person(429,224,MINT,scale=1.44,skin='#bd8464',hair='#483c50'),
      'esperar-a-vez':line(116,307,116,127,'#a7bacd',13)+line(116,127,218,127,'#a7bacd',13)+line(218,127,423,306,'#7399d0',23)+path('M 218 115 L 432 293','none','#a7c6eb',7)+''.join(line(132,y,192,y,'#96adc5',7) for y in [173,216,260])+person(282,173,CORAL,pose='sit',scale=.70)+shadow(508,307,39,7)+person(508,250,PURPLE,scale=.85,skin='#8e6251',hair='#3f3447'),
      'mais-frutas':shadow(179,272,126,10)+shadow(469,272,126,10)+ellipse(179,240,130,45,'#d8e4ee')+ellipse(179,232,122,37,'#fcfbf5')+ellipse(469,240,130,45,'#d8e4ee')+ellipse(469,232,122,37,'#fcfbf5')+apple(119,220)+apple(179,216)+apple(239,220)+apple(436,220)+apple(502,220),
      'antes-depois':''.join(panel(x) for x in [25,231,437])+person(110,221,BLUE,pose='reach',scale=.82)+rect(145,209,40,58,'#fefbf4',5, '#c3d2df')+person(317,221,BLUE,pose='reach',scale=.82)+rect(348,209,40,58,'#fefbf4',5,'#c3d2df')+line(348,220,366,235,PURPLE,4)+person(523,221,BLUE,pose='reach',scale=.82)+rect(552,152,41,61,'#fefbf4',5,'#c3d2df')+circle(573,175,10,YELLOW)+line(563,198,581,198,MINT,3),
      'pequeno-grande':line(59,298,582,298,'#c2ccda',3)+block(85,221,99,77,BLUE)+block(241,172,135,126,PURPLE)+block(428,105,155,193,YELLOW),
      'rima-gato':cat(320,100)+shadow(135,313,41,6)+ball(135,270,40)+shadow(318,313,55,6)+duck(312,262)+house(505,247),
      'personagem-historia':shadow(130,255,77,7)+shadow(325,255,55,7)+shadow(522,255,57,7)+turtle(126,198)+rabbit(325,188)+cat(521,186),
      'ordem-historia':panel(30,274)+panel(336,274)+person(133,214,BLUE,pose='reach',scale=.84)+rect(172,262,88,24,'#b39378',9)+circle(191,241,6,'#d9b66d')+person(427,214,MINT,pose='reach',scale=.84)+rect(478,262,91,24,'#b39378',9)+rect(465,216,44,32,BLUE,9)+path('M 505 218 L 536 233','none',BLUE,11)+path('M 467 220 Q 448 207 451 232','none',BLUE,5)+line(525,241,525,247,'#74b3d7',3)+line(537,246,537,253,'#74b3d7',3),
      'pular':line(83,319,557,319,'#bacadb',4)+shadow(320,311,47,7)+person(320,213,YELLOW,pose='up')+line(260,274,254,290,'#adb9cc',3)+line(380,274,386,290,'#adb9cc',3),
      'equilibrio':line(70,315,570,315,'#90b9ce',10)+person(320,256,MINT,pose='balance'),
      'alongar':shadow(114,307,52,7)+shadow(320,307,52,7)+shadow(511,307,66,7)+person(114,252,PURPLE,pose='sit',scale=.90)+person(320,231,YELLOW,pose='up')+path('M 490 255 L 467 273 L 476 298 M 541 253 L 551 298','none','#dca37e',15)+rect(459,233,89,29,MINT,14)+circle(540,218,26,'#bd8464')+path('M 517 213 Q 524 185 548 194 Q 566 198 565 220 Q 551 204 537 207 Z','#483c50')+circle(550,218,2.8,INK)+path('M 549 230 Q 555 235 560 229','none',INK,2),
    }


def main():
    ASSETS.mkdir(parents=True,exist_ok=True)
    artwork=scenes()
    count=0
    for quiz in json.loads((ROOT/'prisma/quiz-data/infantil.json').read_text()):
        for question in quiz['questions']:
            image=question['media']['image']
            content='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img"><title>'+escape(image['alt'])+'</title><rect width="640" height="360" rx="28" fill="#fffaf1"/>'+artwork[question['originKey']]+'</svg>\n'
            target=ASSETS/(image['assetId']+'.svg')
            if target.exists() and target.read_text()!=content:
                raise RuntimeError('Use a new asset ID for a revised scene: '+image['assetId'])
            target.write_text(content)
            count+=1
    print(f'Generated {count} modern SVG instruction scenes.')


if __name__=='__main__':
    main()
