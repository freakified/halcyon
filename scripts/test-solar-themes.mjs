// Run from the repository root; requires cc and config-page dependencies.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const dir = mkdtempSync(join(tmpdir(), 'halcyon-solar-'));
try {
  const { buildSync } = require('../config-page/node_modules/esbuild');
  for (const [source, name] of [['solarTheme', 'preview'], ['defaultSettings', 'defaults']]) {
    buildSync({entryPoints: [`config-page/src/utils/${source}.ts`], bundle: true, platform: 'node', format: 'cjs', outfile: join(dir, `${name}.cjs`)});
  }
  const { solarThemeState: state, blendColor, solarPalette, COLOR_FIELDS, RING_FIELDS,
    solarRing, dayWeight, backgroundWeight, readableColor, ditherArgb,
    backgroundBucket, bucketRadius, backgroundPixels } = require(join(dir, 'preview.cjs'));
  const { getDefaultSettings } = require(join(dir, 'defaults.cjs'));
  writeFileSync(join(dir, 'runner.c'), `
#include <stdio.h>
#include "solar_theme.h"
int main(void) {
  char op;
  int a,b,c,p[8];
  while (scanf(" %c %d %d %d", &op,&a,&b,&c) == 4) {
    SolarThemeState s = solar_theme_state(a,b,c);
    if(op=='s') printf("%d %d %d %d %d\\n",s.night,s.event,s.stage,s.weight,s.progress);
    else if(op=='w') printf("%d %d %d %d %d\\n",solar_theme_day_weight(s),
      solar_theme_background_weight(s,0),solar_theme_background_weight(s,192),
      solar_theme_background_weight(s,224),solar_theme_background_weight(s,256));
    else if(op=='r') {
      for(int i=0;i<8;i++) if(scanf(" %d", &p[i])!=1) return 1;
      SolarRingPalette day={p[0],p[1],p[2],p[3]},night={p[4],p[5],p[6],p[7]};
      SolarRingPalette r=solar_theme_ring(s,day,night);
      printf("%d %d %d %d\\n",r.night,r.day,r.sunrise,r.sunset);
    } else if(op=='d') {
      if(scanf(" %d %d", &p[0], &p[1])!=2) return 1;
      printf("%d\\n",solar_theme_dither(a,b,c,p[0],p[1]));
    } else if(op=='g') {
      if(scanf(" %d %d", &p[0], &p[1])!=2) return 1;
      printf("%d\\n",solar_theme_background_bucket(a,b,c,p[0],p[1]));
    } else if(op=='q') printf("%d\\n",solar_theme_bucket_radius(a,b));
    else if(op=='c') printf("%d\\n",solar_theme_readable(a,b,c));
    else printf("%d\\n",solar_theme_blend(a,b,c));
  }
  return 0;
}
`);
  execFileSync('cc', ['-Wall', '-Wextra', '-Werror', '-std=c99', '-Isrc/c', join(dir,'runner.c'), 'src/c/solar_theme.c', '-o', join(dir,'runner')]);
  const cases = [[360,1080],[1380,600],[30,1410],[360,390],[360,361],[-1,-1],[0,0],[720,720],[-1,1080],[360,360],[1440,1500]];
  const requests = [], expected = [];
  const request = (input, output) => { requests.push(input); expected.push(output); };
  const hex = n => [4,2,0].map(shift => (((n>>shift)&3)*85).toString(16).padStart(2,'0')).join('').toUpperCase();
  const argb = h => 192 | [16,8,0].reduce((n,shift,i)=> n | ((parseInt(h,16)>>(shift+6))&3) << (4-i*2),0);
  for (const [rise,set] of cases) for(let m=0;m<1440;m++) {
    const s=state(m,rise,set);
    request(`s ${m} ${rise} ${set}`,`${Number(s.night)} ${s.event} ${s.stage} ${s.weight} ${s.progress}`);
    request(`w ${m} ${rise} ${set}`,[dayWeight(s),...[0,192,224,256].map(r=>backgroundWeight(s,r))].join(' '));
    assert(s.weight>=0 && s.weight<=256 && s.stage>=0 && s.stage<=2);
    if (rise<0 || rise>=1440 || set<0 || set>=1440 || rise===set) {
      assert.equal(s.event,0,'invalid/equal times must not invent a transition');
      assert.equal(s.night,m>=set || m<rise,'invalid/equal times preserve the legacy decision');
    } else {
      const expectedNight=rise<set ? m<rise || m>=set : m>=set && m<rise;
      assert.equal(s.night,expectedNight,'valid intervals follow the solar day, including midnight');
    }
  }
  for(let a=0;a<64;a++) for(let b=0;b<64;b++) {
    for(const w of [0,32,64,128,192,224,256]) {
      request(`b ${a|192} ${b|192} ${w}`,String(argb(blendColor(hex(a),hex(b),w))));
    }
    for(const bg of [0,21,42,63,3,12,48,15,51]) {
      request(`c ${a|192} ${b|192} ${bg|192}`,String(argb(readableColor(hex(a),hex(b),hex(bg)))));
    }
  }
  const palette = values => Object.fromEntries(RING_FIELDS.map((key,i)=>[key,hex(values[i])]));
  for(let seed=0;seed<8;seed++) {
    const values=Array.from({length:8},(_,i)=>(seed*17+i*7)%64);
    const day=palette(values.slice(0,4)), night=palette(values.slice(4));
    for(let m=0;m<1440;m++) {
      request(`r ${m} 360 1080 ${values.map(v=>v|192).join(' ')}`,
        RING_FIELDS.map(k=>argb(solarRing(state(m,360,1080),day,night)[k])).join(' '));
    }
  }
  // The full 4x4 tile must preserve the interpolated mean (within half of
  // one coverage step), use only adjacent channel levels, and never shift phase.
  const pairs=[[7,50],[48,12],[53,34],[13,37]];
  for(let a=0;a<4;a++) for(let b=0;b<4;b++) pairs.push([a*21,b*21]);
  for(const [a,b] of pairs) for(let w=0;w<=256;w++) {
    const sum=[0,0,0];
    for(let y=0;y<4;y++) for(let x=0;x<4;x++) {
      const color=ditherArgb(a|192,b|192,w,x,y);
      request(`d ${a|192} ${b|192} ${w} ${x} ${y}`,String(color));
      assert.equal(color,ditherArgb(a|192,b|192,w,x+4,y+4),'spatial phase must be fixed');
      for(let i=0;i<3;i++) {
        const shift=i*2, level=(color>>shift)&3;
        const ideal=(((a>>shift)&3)*(256-w)+((b>>shift)&3)*w)/256;
        assert(level===Math.floor(ideal) || level===Math.ceil(ideal));
        sum[i]+=level;
      }
      if(w===0 || w===256 || a===b) assert.equal(color,(w===256?b:a)|192);
    }
    for(let i=0;i<3;i++) {
      const ideal=(((a>>(i*2))&3)*(256-w)+((b>>(i*2))&3)*w)/256;
      assert(Math.abs(sum[i]/16-ideal)<=1/32,'tile mean must follow the requested blend');
    }
  }
  for(const [width,height,round] of [[214,214,true],[142,142,true],[106,130,false],[154,182,false],[154,95,false]]) {
    for(let y=-1;y<=height;y++) for(let x=-1;x<=width;x++) {
      const bucket=backgroundBucket(x,y,width,height,round);
      request(`g ${x} ${y} ${width} ${height} ${Number(round)}`,String(bucket));
      assert(bucket===-1 || (bucket>=0 && bucket<=256));
      if(x<0 || x>=width || y<0 || y>=height) assert.equal(bucket,-1);
    }
    assert(backgroundBucket(width/2|0,height/2|0,width,height,round)<=Math.floor(256/Math.min(width,height)));
    if(round) assert.equal(backgroundBucket(0,0,width,height,round),-1);
  }
  for(let bucket=0;bucket<=256;bucket++) for(const round of [false,true]) {
    const radius=bucketRadius(bucket,round);
    request(`q ${bucket} ${Number(round)} 0`,String(radius));
    if(round) assert(radius*radius<=bucket*256 && (radius+1)**2>bucket*256);
  }
  for(const minute of [315,360,405]) {
    const s=state(minute,360,1080), pixels=backgroundPixels(s,'000055','FFFFFF',32,32);
    assert.deepEqual(pixels,backgroundPixels(s,'000055','FFFFFF',32,32),'same minute must produce identical pixels');
    for(let y=0;y<32;y++) for(let x=0;x<32;x++) {
      const i=(y*32+x)*4, inside=backgroundBucket(x,y,32,32,true)>=0;
      assert.equal(pixels[i+3],inside?255:0,'outside circle must stay transparent');
      if(inside && minute!==360) assert.deepEqual([...pixels.slice(i,i+3)],minute===315?[0,0,85]:[255,255,255]);
    }
  }
  const actual=execFileSync(join(dir,'runner'),{input:requests.join('\n')+'\n',maxBuffer:8*1024*1024}).toString().trim().split('\n');
  assert.deepEqual(actual, expected, 'C and browser results must agree');
  assert.deepEqual(state(360,360,1080),{night:false,event:1,stage:1,weight:128,progress:128});
  assert.deepEqual(state(1080,360,1080),{night:true,event:2,stage:1,weight:128,progress:128});
  assert.equal(state(315,360,1080).event,0); assert.equal(state(1125,360,1080).event,0);
  assert.equal(state(0,1380,600).night,false); assert.equal(state(720,1380,600).night,true);
  for(const r of [0,192,224,256]) {
    let previous=0;
    for(let m=315;m<=405;m++) {
      const w=backgroundWeight(state(m,360,1080),r);
      assert(w>=previous); previous=w;
      assert.equal(w,256-backgroundWeight(state(m+720,360,1080),r));
    }
  }
  // Distinct custom tokens prove the requested progression uses the actual settings.
  const day=palette([2,14,53,41]),night=palette([9,31,47,60]);
  const ring=m=>solarRing(state(m,360,1080),day,night);
  assert.deepEqual(ring(315),night);
  assert.equal(ring(345).RING_NIGHT_COLOR,night.RING_SUNRISE_COLOR);
  assert.equal(ring(345).RING_DAY_COLOR,night.RING_DAY_COLOR);
  assert.equal(ring(360).RING_SUNRISE_COLOR,blendColor(night.RING_SUNRISE_COLOR,day.RING_SUNRISE_COLOR,128));
  assert.equal(ring(375).RING_DAY_COLOR,day.RING_SUNRISE_COLOR);
  assert.equal(ring(375).RING_NIGHT_COLOR,day.RING_NIGHT_COLOR);
  assert.deepEqual(ring(405),day);
  assert.equal(ring(1065).RING_DAY_COLOR,day.RING_SUNSET_COLOR);
  assert.equal(ring(1065).RING_NIGHT_COLOR,day.RING_NIGHT_COLOR);
  assert.equal(ring(1080).RING_SUNSET_COLOR,blendColor(day.RING_SUNSET_COLOR,night.RING_SUNSET_COLOR,128));
  assert.equal(ring(1095).RING_NIGHT_COLOR,night.RING_SUNSET_COLOR);
  assert.equal(ring(1095).RING_DAY_COLOR,night.RING_DAY_COLOR);
  assert.deepEqual(ring(1125),night);
  assert.equal(readableColor('000000','FFFFFF','5555AA'),'FFFFFF');
  assert.equal(readableColor('000000','FFFFFF','AAAAAA'),'000000');

  const settings = getDefaultSettings({BW:false,HEALTH:true});
  for(const [rise,set] of cases) for(let m=0;m<1440;m++) {
    assert.equal(solarPalette({...settings,SETTING_DYNAMIC_SOLAR_THEME:0,SETTING_USE_NIGHT_THEME:1},m,rise,set).night,m>=set || m<rise);
  }
  for(const enabled of [0,1]) for(const nightEnabled of [0,1]) for(let m=0;m<1440;m++) {
    const s={...settings,SETTING_DYNAMIC_SOLAR_THEME:enabled,SETTING_USE_NIGHT_THEME:nightEnabled};
    const before=JSON.stringify(s);
    const {colors,night,backgroundAt}=solarPalette(s,m,360,1080);
    for(const key of COLOR_FIELDS) {
      if(!enabled || !nightEnabled) assert.equal(colors[key],s[`SETTING_${night?'NIGHT_':''}${key}`]);
      if(['TIME_COLOR','SUBTEXT_PRIMARY_COLOR','SUBTEXT_SECONDARY_COLOR'].includes(key)) {
        assert([s[`SETTING_${key}`],s[`SETTING_NIGHT_${key}`]].includes(colors[key]));
      }
      assert.match(colors[key],/^(00|55|AA|FF){3}$/);
    }
    for(const r of [0,64,128,192,224,256]) assert.match(backgroundAt(r),/^(00|55|AA|FF){3}$/);
    assert.equal(JSON.stringify(s),before,'source themes must not be overwritten');
  }
  // Equal theme colors must remain exactly that color: no hidden sunrise/sunset palette.
  for(const color of ['00FF55','AA00AA','555555']) {
    const s={...settings,SETTING_DYNAMIC_SOLAR_THEME:1,SETTING_USE_NIGHT_THEME:1};
    for(const key of COLOR_FIELDS) {s[`SETTING_${key}`]=color;s[`SETTING_NIGHT_${key}`]=color;}
    for(let m=0;m<1440;m++) {
      const result=solarPalette(s,m,360,1080);
      assert(Object.values(result.colors).every(v=>v===color));
      assert.equal(result.backgroundAt(256),color);
    }
  }
  console.log(`PASS: ${requests.length} C/browser comparisons; Bayer coverage, palette bounds, fixed phase, clipping, custom-color anchors, separate sections, background progression, opt-out, wraparound, short days and source-palette preservation.`);
} finally { rmSync(dir,{recursive:true,force:true}); }
