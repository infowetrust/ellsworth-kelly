#!/usr/bin/env node
/* Merge approved source reviews; SVG replay and annotation update are separate guarded steps. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),{mergeReviews}=require('./color_reviews.cjs');
const root=path.resolve(__dirname,'..'),file=path.join(root,'data/color-studies.json'),manifest=JSON.parse(fs.readFileSync(path.join(root,'data/color-review-overrides.json'))),result=mergeReviews(JSON.parse(fs.readFileSync(file)),manifest);
if(process.argv.includes('--apply')){const text=JSON.stringify(result,null,2)+'\n';fs.writeFileSync(file,text);fs.writeFileSync(path.join(root,'site/dist/data/color-studies.json'),text);}
console.log(JSON.stringify({...result.review_summary,applied:process.argv.includes('--apply')},null,2));
