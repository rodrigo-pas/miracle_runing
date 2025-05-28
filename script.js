const workers = [
    { id: 1, active: false, mana: 0, regen: 0, lastUpdate: null, timer: null, ready: false },
    { id: 2, active: false, mana: 0, regen: 0, lastUpdate: null, timer: null, ready: false },
    { id: 3, active: false, mana: 0, regen: 0, lastUpdate: null, timer: null, ready: false }
];

let currentUH = 0;
let bpCount = 0;

function getManaCost(modeValue) {
    return parseInt(modeValue.split('-')[1]);
}

function getUHAmount(modeValue) {
    const [type, mana] = modeValue.split('-');
    const cost = parseInt(mana);
    if (type === 'uh') return cost / 100;
    if (type === 'hmm') return cost / 70;
    if (type === 'gfb') return cost / 120;
    if (type === 'sd') return cost / 220;
    return 0;
}

function toggleWorker(id) {
    const worker = workers.find(w => w.id === id);
    const promo = document.getElementById(`promo${id}`).checked;
    const modeValue = document.getElementById(`mode${id}`).value;
    const manaStart = parseFloat(document.getElementById(`manaStart${id}`).value) || 0;

    worker.regen = promo ? 4 : 6;
    worker.mana = manaStart;
    worker.lastUpdate = Date.now();
    worker.ready = false;

    if (!worker.active) {
        worker.timer = setInterval(() => {
            updateMana(worker, id);
        }, 500);
        worker.active = true;
    } else {
        clearInterval(worker.timer);
        worker.active = false;
        document.getElementById(`timer${id}`).innerText = "--:--";
        document.getElementById(`alert${id}`).innerText = "";
    }
}

function updateMana(worker, id) {
    const now = Date.now();
    const secondsPassed = (now - worker.lastUpdate) / 1000;
    worker.lastUpdate = now;

    const manaPerSecond = 1 / worker.regen;
    worker.mana += secondsPassed * manaPerSecond;

    updateManaDisplay(id);
    updateTimerDisplay(id);

    const manaNeeded = getManaCost(document.getElementById(`mode${id}`).value);
    const name = document.getElementById(`name${id}`).value || `Runador ${id}`;
    const alertBox = document.getElementById(`alert${id}`);

    if (worker.mana >= manaNeeded) {
        if (!worker.ready) {
            alertBox.innerText = `🔥 ${name} pronto para fazer magia!`;
            playAlert();
            popup(`🧙‍♂️ ${name} está pronto para fazer magia!`);
            worker.ready = true;
        }
    } else {
        alertBox.innerText = "";
        worker.ready = false;
    }
}

function executeSpell(id) {
    const worker = workers.find(w => w.id === id);
    const modeValue = document.getElementById(`mode${id}`).value;
    const manaNeeded = getManaCost(modeValue);
    const name = document.getElementById(`name${id}`).value || `Runador ${id}`;

    if (worker.mana >= manaNeeded) {
        worker.mana -= manaNeeded;
        produceUH(name, getUHAmount(modeValue));
        updateManaDisplay(id);
        updateTimerDisplay(id);
        document.getElementById(`alert${id}`).innerText = '';
        worker.ready = false;
    } else {
        alert(`${name} não tem mana suficiente.`);
    }
}

function produceUH(name, amount) {
    currentUH += amount;

    while (currentUH >= 20) {
        currentUH -= 20;
        bpCount++;
        popup(`🎉 BP COMPLETA! Total de ${bpCount} BPs.`);
    }

    popup(`${name} produziu ${amount} UH(s).`);
    updateStatus();
}

function updateManaDisplay(id) {
    const worker = workers.find(w => w.id === id);
    document.getElementById(`manaDisplay${id}`).innerText = Math.floor(worker.mana);
}

function updateTimerDisplay(id) {
    const worker = workers.find(w => w.id === id);
    const modeValue = document.getElementById(`mode${id}`).value;
    const manaNeeded = getManaCost(modeValue) - (worker.mana % getManaCost(modeValue));
    const secondsLeft = Math.ceil(manaNeeded * worker.regen);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    document.getElementById(`timer${id}`).innerText =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateStatus() {
    document.getElementById('bpCount').innerText = `Backpacks completas: ${bpCount}`;
    document.getElementById('uhCount').innerText = `UH atual na BP: ${currentUH}/20`;
}

function popup(message) {
    alert(message);
    playAlert();
}

function playAlert() {
    if (document.getElementById('soundToggle').checked) {
        const audio = document.getElementById('alertSound');
        audio.currentTime = 0;
        audio.play();
    }
}
