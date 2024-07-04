startPauseBt = document.querySelector('#start-pause');
const iniciarOuPausarBt = document.querySelector('#start-pause span');
const iniciarOuPausarBtIcone = document.querySelector('.app__card-primary-button-icon');
const tempoNaTela = document.querySelector('#timer');

let tempoDecorridoEmSegundos = 10;
let intervaloId = null;
let timerRunning = false;
let timerInterval;

mostrarTempo();
    botoes.forEach(function (contexto){
    contexto.classList.remove('active');
    });

const contagemRegressiva = () =>{
    if(tempoDecorridoEmSegundos <=0){
        audioTempoFinalizado.play();
        alert('Tempo finalizado!');
        zerar();
        return;
    }
    tempoDecorridoEmSegundos -=1;
    mostrarTempo();
    };

startPauseBt.addEventListener('click', iniciarOuPausar);

function iniciarOuPausar() {
    if (timerRunning) {
        audioPausa.play();
        stopTimer();
        iniciarOuPausarBt.textContent = "Começar";
    } else {
        audioPlay.play();
        startTimer(tempoDecorridoEmSegundos);
        iniciarOuPausarBt.textContent = "Pausar"; 
    }
}

function startTimer(duration) {
    let timer = duration;
    timerInterval = setInterval(function () {
        tempoDecorridoEmSegundos = timer;
        mostrarTempo();
        if (--timer < 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            audioTempoFinalizado.play();
            alert('Tempo finalizado!');
            zerar();
        }
    }, 1000);
    timerRunning = true;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function zerar(){
    clearInterval(intervaloId);
    iniciarOuPausarBt.textContent = "Começar";
    iniciarOuPausarBtIcone.setAttribute('src', `./imagens/play_arrow.png`);
    intervaloId = null;
}

function mostrarTempo(){
    const tempo = new Date(tempoDecorridoEmSegundos*1000);
    const tempoFormatado = tempo.toLocaleTimeString('pt-Br', {minute: '2-digit', second: '2-digit'});
    tempoNaTela.innerHTML = `${tempoFormatado}`;
}

mostrarTempo();
