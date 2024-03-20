window.addEventListener('load', function(){
    const canvas = document.querySelector('#gameCanvas');


    let menu = document.querySelector('#menu');
    
    getGameSettings();

    let game;

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        // console.log(deltaTime);
        lastTime = timeStamp;
        game.render(deltaTime);
        requestId = requestAnimationFrame(animate);
    };
    // animate(0);
    
    function getGameSettings(){
        menu.setAttribute('style', 'display: initial;');
    };

    const btn = document.querySelector("#start");

    btn.addEventListener("click", function () {
        let boardHeight = document.getElementById('rows').value * 1;
        let boardWidth = document.getElementById('cols').value * 1;
        game = new Game(canvas, boardWidth, boardHeight);
        backgroundMusic.play();
        menu.setAttribute('style', 'display: none;');
        animate(0);
    });

});

