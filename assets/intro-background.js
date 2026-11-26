/* A single multiband composite: no separately positioned rectangular photograph. */
(() => {
  'use strict';
  const intro = document.getElementById('intro');
  const photo = intro?.querySelector('.introart');
  const output = intro?.querySelector('canvas.introbg');
  const content = intro?.querySelector('.introinner');
  if (!photo || !output || document.documentElement.classList.contains('no-intro')) return;
  let scenery, variant, frame, lastSize = '';
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); };
  function surface(w,h) { const c=document.createElement('canvas');c.width=w;c.height=h;return c; }
  function resized(source,w,h,blur=0) {
    const c=surface(w,h),ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';
    if(blur)ctx.filter=`blur(${blur}px)`;
    ctx.drawImage(source,0,0,w,h);return c;
  }
  function pyramid(source) {
    const levels=[source];
    while(levels.length<7 && Math.min(source.width,source.height)>12) {
      source=resized(source,Math.max(1,Math.round(source.width/2)),Math.max(1,Math.round(source.height/2)),.8);
      levels.push(source);
    }
    return levels;
  }
  function blend(source,background,mask) {
    const a=pyramid(source),b=pyramid(background),m=pyramid(mask);
    let result;
    for(let level=a.length-1;level>=0;level--) {
      const w=a[level].width,h=a[level].height;
      const ac=a[level].getContext('2d').getImageData(0,0,w,h).data;
      const bc=b[level].getContext('2d').getImageData(0,0,w,h).data;
      const mc=m[level].getContext('2d').getImageData(0,0,w,h).data;
      let au,bu,ru;
      if(result) {
        au=resized(a[level+1],w,h).getContext('2d').getImageData(0,0,w,h).data;
        bu=resized(b[level+1],w,h).getContext('2d').getImageData(0,0,w,h).data;
        ru=resized(result,w,h).getContext('2d').getImageData(0,0,w,h).data;
      }
      result=surface(w,h);const ctx=result.getContext('2d'),pixels=ctx.createImageData(w,h);
      for(let i=0;i<pixels.data.length;i+=4) {
        const weight=mc[i]/255;
        for(let ch=0;ch<3;ch++)pixels.data[i+ch]=ru
          ?ru[i+ch]+(ac[i+ch]-au[i+ch])*weight+(bc[i+ch]-bu[i+ch])*(1-weight)
          :ac[i+ch]*weight+bc[i+ch]*(1-weight);
        pixels.data[i+3]=255;
      }
      ctx.putImageData(pixels,0,0);
    }
    return result;
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(paint);}
  function paint(){
    if(intro.hidden||!photo.naturalWidth)return;
    const box=intro.getBoundingClientRect(),ui=content.getBoundingClientRect();
    if(!box.width||!box.height)return;
    const mobile=box.width<=760,next=mobile?'mobile':'desktop';
    if(variant!==next){
      variant=next;scenery=null;const candidate=new Image();
      candidate.onload=()=>{if(variant===next){scenery=candidate;lastSize='';schedule();}};
      candidate.src=`assets/intro-scene-${next}.jpg?v=20261126`;return;
    }
    if(!scenery?.naturalWidth)return;
    const key=[box.width,box.height,ui.top,ui.height,next].join(':');if(lastSize===key)return;
    // Keep the complete mobile photo above the title, using the actual visible height.
    const ratio=photo.naturalWidth/photo.naturalHeight;
    let ph,pw,x,y;
    if(mobile){
      const bottom=Math.min(box.height*.60,ui.top-box.top-22);
      ph=Math.min(box.width*.98/ratio,box.height*.56,Math.max(120,bottom-box.height*.055));
      pw=ph*ratio;x=(box.width-pw)/2;y=bottom-ph;
    }else{
      ph=Math.min(box.height*.80,box.width*.75/ratio,1000);pw=ph*ratio;
      x=(box.width-pw)/2;y=box.height*.43-ph/2;
    }
    const density=Math.min(window.devicePixelRatio||1,1.25,1600/box.width);
    const w=Math.ceil(box.width*density),h=Math.ceil(box.height*density),pad=Math.ceil(60*density);
    x*=density;y*=density;pw*=density;ph*=density;
    const arena=surface(w+pad*2,h+pad*2),ctx=arena.getContext('2d');
    const cuts=mobile?[0,.302,.5,1]:[0,.51,.80,1];
    const target=[-pad,y+ph*.5,y+ph*.818,h+pad];
    for(let i=0;i<3;i++)ctx.drawImage(scenery,0,cuts[i]*scenery.naturalHeight,scenery.naturalWidth,(cuts[i+1]-cuts[i])*scenery.naturalHeight,0,target[i]+pad,w+pad*2,target[i+1]-target[i]);
    const grade=ctx.createLinearGradient(0,0,0,y+ph*.84+pad);
    grade.addColorStop(0,'rgba(2,5,10,.32)');grade.addColorStop(.78,'rgba(2,5,10,.32)');grade.addColorStop(1,'rgba(2,5,10,0)');
    ctx.fillStyle=grade;ctx.fillRect(0,0,arena.width,arena.height);
    const background=surface(w,h),bg=background.getContext('2d');
    bg.filter=`blur(${9*density}px)`;bg.drawImage(arena,-pad,-pad);bg.filter='none';
    const foreground=resized(background,w,h);foreground.getContext('2d').drawImage(photo,x,y,pw,ph);
    const mask=surface(w,h),maskContext=mask.getContext('2d'),maskPixels=maskContext.createImageData(w,h);
    for(let py=0;py<h;py++)for(let px=0;px<w;px++){
      const u=(px-x)/pw,v=(py-y)/ph;
      let alpha=0;
      if(u>0&&u<1&&v>0&&v<1){
        // Organic oval support avoids straight rectangular seams. Dedicated soft
        // foreground supports retain the standing and reclining athletes in full.
        const oval=Math.sqrt(((u-.5)/.50)**2+((v-.50)/.54)**2);
        const body=Math.sqrt(((u-.46)/.23)**2+((v-.49)/.36)**2);
        const ground=Math.hypot(Math.max(.12-u,0,u-.84)/.14,(v-.84)/.145);
        alpha=Math.max(1-smooth((oval-.50)/.50),1-smooth((body-.70)/.30),1-smooth((ground-.72)/.28));
        // Even subject support fades before the finite source boundary.
        alpha*=smooth(Math.min(u,1-u,v,1-v)/.035);
      }
      const i=(py*w+px)*4;maskPixels.data[i]=maskPixels.data[i+1]=maskPixels.data[i+2]=Math.round(alpha*255);maskPixels.data[i+3]=255;
    }
    maskContext.putImageData(maskPixels,0,0);
    const composite=blend(foreground,background,mask);
    const sharp=surface(w,h);sharp.getContext('2d').drawImage(composite,0,0);
    // Blur the already unified image progressively away from the original scene.
    for(const [radius,start,finish]of[[18,.10,.32],[38,.25,.65]]){
      const layer=resized(sharp,w,h,radius*density),lc=layer.getContext('2d'),pixels=lc.getImageData(0,0,w,h);
      for(let py=0;py<h;py++)for(let px=0;px<w;px++){
        const nx=(px-(x+pw*.5))/(pw*.56),ny=(py-(y+ph*.50))/(ph*.58);
        const distance=Math.max(0,Math.hypot(nx,ny)-1);
        pixels.data[(py*w+px)*4+3]=Math.round(255*smooth((distance-start)/(finish-start)));
      }
      lc.putImageData(pixels,0,0);composite.getContext('2d').drawImage(layer,0,0);
    }
    output.width=w;output.height=h;output.getContext('2d').drawImage(composite,0,0);
    output.dataset.scene=next;output.dataset.composite='multiband';
    output.dataset.photoBottom=String(Math.round((y+ph)/density));
    output.dataset.contentTop=String(Math.round(ui.top-box.top));
    lastSize=key;
  }
  photo.addEventListener('load',schedule,{once:true});
  if(photo.complete)schedule();
  const observer=new ResizeObserver(schedule);observer.observe(intro);observer.observe(content);
  window.visualViewport?.addEventListener('resize',schedule);window.addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);
  new MutationObserver(()=>{if(intro.hidden){observer.disconnect();cancelAnimationFrame(frame);window.visualViewport?.removeEventListener('resize',schedule);window.removeEventListener('resize',schedule);}}).observe(intro,{attributes:true,attributeFilter:['hidden']});
})();
