const boyImage = new Image();
boyImage.src = 'assets/man_1.png';

const girlImage = new Image();
girlImage.src = 'assets/woman_1.png';

let imagesLoaded = false;

Promise.all([
    new Promise(resolve => { boyImage.onload = resolve; boyImage.onerror = resolve; }),
    new Promise(resolve => { girlImage.onload = resolve; girlImage.onerror = resolve; })
]).then(() => {
    imagesLoaded = true;
});

function drawCharacterSelect() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 50px "Kashima Rus", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ВЫБЕРИ НИНДЗЯ', canvas.width/2, 150);
    
    const boyX = canvas.width/2 - 250;
    const girlX = canvas.width/2 + 60;
    const charY = canvas.height/2 - 150;
    const charWidth = 170;
    const charHeight = 350;
    
    if (!imagesLoaded) {
        if (window.hoveredCharacter === 'boy') {
            ctx.fillStyle = '#ffaa00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = '#cc9900';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(boyX, charY, charWidth, charHeight);
        
        if (window.hoveredCharacter === 'girl') {
            ctx.fillStyle = '#ffaa00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = '#cc9900';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(girlX, charY, charWidth, charHeight);
    } else {
        ctx.shadowBlur = 0;
        
        if (window.hoveredCharacter === 'boy') {
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 40;
        }
        ctx.drawImage(boyImage, boyX, charY, charWidth, charHeight);
        
        ctx.shadowBlur = 0;
        
        if (window.hoveredCharacter === 'girl') {
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 40;
        }
        ctx.drawImage(girlImage, girlX, charY, charWidth, charHeight);
        
        ctx.shadowBlur = 0;
    }
    
    ctx.font = 'bold 35px "Kashima Rus", Arial';
    
    if (window.hoveredCharacter === 'boy') {
        ctx.fillStyle = '#ffffff';
    } else {
        ctx.fillStyle = '#ffcc00';
    }
    ctx.fillText('MAN', canvas.width/2 - 170, canvas.height/2 + 220);
    
    if (window.hoveredCharacter === 'girl') {
        ctx.fillStyle = '#ffffff';
    } else {
        ctx.fillStyle = '#ffcc00';
    }
    ctx.fillText('WOMAN', canvas.width/2 + 150, canvas.height/2 + 220);
}