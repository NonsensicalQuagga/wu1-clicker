/* Med document.queryselector(selector) kan vi hämta
 * de element som vi behöver från html dokumentet.
 * Vi spearar elementen i const variabler då vi inte kommer att
 * ändra dess värden.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * Viktigt: queryselector ger oss ett html element eller flera om det finns.
 */ 
const clickerButton = document.querySelector('#game-button');
const moneyTracker = document.querySelector('#money');
const mpsTracker = document.querySelector('#mps'); // money per second
const mpcTracker = document.querySelector('#mpc'); // money per click
const upgradesTracker = document.querySelector('#upgrades');
const upgradeList = document.querySelector('#upgradelist');
const msgbox = document.querySelector('#msgbox');
const audioAchievement = document.querySelector('#swoosh');
const soulsTracker = document.querySelector("#souls");

/* Följande variabler använder vi för att hålla reda på hur mycket pengar som
 * spelaren, har och tjänar.
 * last används för att hålla koll på tiden.
 * För dessa variabler kan vi inte använda const, eftersom vi tilldelar dem nya
 * värden, utan då använder vi let.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
 */
let money = 0;
let moneyPerClick = 1;
let moneyPerSecond = 0;
let acquiredUpgrades = 0;
let last = 0;
let numberOfClicks = 0; // hur många gånger har spelare eg. klickat
let active = false; // exempel för att visa att du kan lägga till klass för att indikera att spelare får valuta
let souls = 0;

// likt upgrades skapas här en array med objekt som innehåller olika former
// av achievements.
// requiredSOMETHING är vad som krävs för att få dem

let achievements = [
    {
        description: 'Museet är redo att öppna, grattis! ',
        requiredUpgrades: 1,
        acquired: false,
    },
    {
        description: 'Nu börjar det likna något, fortsätt gräva!',
        requiredUpgrades: 10,
        acquired: false,
    },
    {
        description: 'Klickare, med licens att klicka!',
        requiredClicks: 10,
        acquired: false,
    },
    {
        description: 'Tac-2 god!',
        requiredClicks: 10000,
        acquired: false,
    },
];

/* Med ett valt element, som knappen i detta fall så kan vi skapa listeners
 * med addEventListener så kan vi lyssna på ett specifikt event på ett html-element
 * som ett klick.
 * Detta kommer att driva klickerknappen i spelet.
 * Efter 'click' som är händelsen vi lyssnar på så anges en callback som kommer
 * att köras vi varje klick. I det här fallet så använder vi en anonym funktion.
 * Koden som körs innuti funktionen är att vi lägger till moneyPerClick till
 * money.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 */
clickerButton.addEventListener(
    'click',
    () => {
        // vid click öka score med moneyPerClick
        money += (moneyPerClick * (1+souls/100));
        // håll koll på hur många gånger spelaren klickat
        numberOfClicks += 1;
        // console.log(clicker.score);
    },
    false
);

/* För att driva klicker spelet så kommer vi att använda oss av en metod som heter
 * requestAnimationFrame.
 * requestAnimationFrame försöker uppdatera efter den refresh rate som användarens
 * maskin har, vanligtvis 60 gånger i sekunden.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * funktionen step används som en callback i requestanaimationframe och det är
 * denna metod som uppdaterar webbsidans text och pengarna.
 * Sist i funktionen så kallar den på sig själv igen för att fortsätta uppdatera.
 */
function step(timestamp) {
    moneyTracker.textContent = money;
    mpsTracker.textContent = (moneyPerSecond * (1+souls/100));
    mpcTracker.textContent = (moneyPerClick * (1+souls/100));
    upgradesTracker.textContent = acquiredUpgrades;
    soulsTracker.textContent = souls;

    if (timestamp >= last + 1000) {
        money += (moneyPerSecond * (1+souls/100));
        last = timestamp;
    }

    if (moneyPerSecond > 0 && !active) {
        mpsTracker.classList.add('active');
        active = true;
    }

    // achievements, utgår från arrayen achievements med objekt
    // koden nedan muterar (ändrar) arrayen och tar bort achievements
    // som spelaren klarat
    // villkoren i första ifsatsen ser till att achivments som är klarade
    // tas bort. Efter det så kontrolleras om spelaren har uppfyllt kriterierna
    // för att få den achievement som berörs.
    achievements = achievements.filter((achievement) => {
        if (achievement.acquired) {
            return false;
        }
        if (
            achievement.requiredUpgrades &&
            acquiredUpgrades >= achievement.requiredUpgrades
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        } else if (
            achievement.requiredClicks &&
            numberOfClicks >= achievement.requiredClicks
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        }
        return true;
    });

    window.requestAnimationFrame(step);
}
function drawUpgrades() {
    upgradeList.innerHTML = '';
    upgrades.forEach((upgrade) => {
        upgradeList.appendChild(createCard(upgrade));
    });
}


function rebirth(modifier) {
    souls += (1 + Math.floor(money/1000000))
    money = 0;
    moneyPerClick = 1;
    moneyPerSecond = 0;
    last = 0;
    numberOfClicks = 0;
    active = false;
    upgrades = upgrades.map((upgrade) => {
        upgrade.acquired = false;
        if (upgrade.timesUppgraded != 0){
        upgrade.cost = Math.round(upgrade.cost / (upgrade.costMultiplyer ** upgrade.timesUppgraded));  
        upgrade.timesUppgraded = 0;}
        return upgrade;
    });
    drawUpgrades();
}

/* Här använder vi en listener igen. Den här gången så lyssnar iv efter window
 * objeket och när det har laddat färdigt webbsidan(omvandlat html till dom)
 * När detta har skett så skapar vi listan med upgrades, för detta använder vi
 * en forEach loop. För varje element i arrayen upgrades så körs metoden upgradeList
 * för att skapa korten. upgradeList returnerar ett kort som vi fäster på webbsidan
 * med appendChild.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * Efter det så kallas requestAnimationFrame och spelet är igång.
 */
window.addEventListener('load', (event) => {
    drawUpgrades();
    window.requestAnimationFrame(step);
});

/* En array med upgrades. Varje upgrade är ett objekt med egenskaperna name, cost
 * och amount. Önskar du ytterligare text eller en bild så går det utmärkt att
 * lägga till detta.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
 */
upgrades = [
    {
        name: 'Bannana cat',
        cost: 10,
        amount: 1,
        costMultiplyer: 1.5,
        timesUppgraded: 0,
    },
    {
        name: "Gooieduck",
        cost: 10, 
        amountMultiplyer: 2,
        costMultiplyer: 100,
        timesUppgraded: 0,
    },
    {
        name: 'Vanilla cat',
        cost: 50,
        clicks: 2,
        costMultiplyer: 1.5,
        timesUppgraded: 0,
    },
    {
        name: 'Strawberry cat',
        cost: 100,
        amount: 10,
        costMultiplyer: 1.5,
        timesUppgraded: 0,
    },
    {
        name: "zzz",
        cost: 100,
        clickMultiplyer: 2,
        costMultiplyer: 10,
        timesUppgraded: 0,
    },
    {
        name: 'Orange cat',
        cost: 1000,
        amount: 100,
        costMultiplyer: 1.5,
        timesUppgraded: 0,
    },
    {
        name: "Kiwi cat",
        cost: 2000,
        clicks: 50,
        costMultiplyer: 1.75,
        timesUppgraded: 0,
    },
    {
        name: "Grape cat",
        cost: 50000,
        amount: 10000,
        costMultiplyer: 1.75,
        timesUppgraded: 0,
    },
    {
        name: "Cherry cat",
        cost: 1000000,
        amount: 200000,
        costMultiplyer: 2,
        timesUppgraded: 0,
    },
    {
        name: "Rebirth",
        cost: 1000000,
        description: "",
        rebirth: 1,
        costMultiplyer: 1,
        timesUppgraded: 0,
    },
    {
        name: "Singularity Bomb",
        cost: 10000000000,
        clicks: 10000000,
        amount: 100000000,
        clickMultiplyer: 50,
        amountMultiplyer: 50,
        timesUppgraded: 0,
        costMultiplyer: 10000000000,
    }
];

/* createCard är en funktion som tar ett upgrade objekt som parameter och skapar
 * ett html kort för det.
 * För att skapa nya html element så används document.createElement(), elementen
 * sparas i en variabel så att vi kan manipulera dem ytterligare.
 * Vi kan lägga till klasser med classList.add() och text till elementet med
 * textcontent = 'värde'.
 * Sedan skapas en listener för kortet och i den hittar vi logiken för att köpa
 * en uppgradering.
 * Funktionen innehåller en del strängar och konkatenering av dessa, det kan göras
 * med +, variabel + 'text'
 * Sist så fäster vi kortets innehåll i kortet och returnerar elementet.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
function createCard(upgrade) {
    const card = document.createElement('div');
    card.classList.add('card');
    const header = document.createElement('p');
    header.classList.add('title');
    const cost = document.createElement('p');
    if ( upgrade.name === "Singularity Bomb"){
        header.textContent = `${upgrade.name},  ???`;
    } else if (upgrade.amount) {
        header.textContent = `${upgrade.name}, +${upgrade.amount} mat per sekund.`;
    } else if (upgrade.clicks) {
        header.textContent = `${upgrade.name}, +${upgrade.clicks} mat per klick.`;
    } else if (upgrade.clickMultiplyer) {
        header.textContent = `${upgrade.name}, ${upgrade.clickMultiplyer} gånger mat per klick.`;
    } else if (upgrade.amountMultiplyer) {
        header.textContent = `${upgrade.name}, ${upgrade.amountMultiplyer} gånger mat per sekund.`;
    } else {
        header.textContent = `${upgrade.name}, ${upgrade.description} `;
    }
    cost.textContent = `Köp för ${upgrade.cost} Mat.`;

    card.addEventListener('click', (e) => {
        if (money >= upgrade.cost) {
            acquiredUpgrades++;
            money -= upgrade.cost;
            upgrade.cost = Math.floor(upgrade.cost * upgrade.costMultiplyer)
            cost.textContent = 'Köp för ' + upgrade.cost + ' mat';
            moneyPerSecond += upgrade.amount ? upgrade.amount : 0;
            moneyPerSecond *= upgrade.amountMultiplyer  ? upgrade.amountMultiplyer : 1;
            moneyPerClick += upgrade.clicks ? upgrade.clicks : 0;
            moneyPerClick *= upgrade.clickMultiplyer ? upgrade.clickMultiplyer : 1;
            upgrade.timesUppgraded ++;
            message('Grattis du har köpt en uppgradering!', 'success');
            if (upgrade.rebirth === 1) {
                rebirth(upgrade.rebirth);
            }
        } else {
            message('Du har inte råd.', 'warning');
        }
    });

    card.appendChild(header);
    card.appendChild(cost);
    return card;
}

/* Message visar hur vi kan skapa ett html element och ta bort det.
 * appendChild används för att lägga till och removeChild för att ta bort.
 * Detta görs med en timer.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
 */
function message(text, type) {
    const p = document.createElement('p');
    p.classList.add(type);
    p.textContent = text;
    msgbox.appendChild(p);
    if (type === 'achievement') {
        audioAchievement.play();
    }
    setTimeout(() => {
        p.parentNode.removeChild(p);
    }, 2000);
}
