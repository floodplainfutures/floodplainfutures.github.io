const floodLayer = document.querySelector('.flood-layer');
const birdLayer = document.querySelector('.bird-layer');
const speciesItems = document.querySelectorAll('.species-list li');

/*
API PLACEHOLDER (to be activated later)

const EBIRD_API_KEY = "qnd5fjt43a8iY";
const REGION = "US-CA-113";

// fetch(`https://api.ebird.org/v2/obs/region/recent/${REGION}`, {
//   headers: { "X-eBirdApiToken": EBIRD_API_KEY }
// })
//   .then(res => res.json())
//   .then(data => {
//     // process bird observations into monthly totals here
//   });
*/

/* TEMPORARY MOCK DATA (for visualization testing) */

const floodByMonth = [15, 30, 75, 90, 70, 25, 10, 5, 10, 30, 65, 85];

const birdsBySpecies = {
  "sandhill-crane": [5, 15, 60, 80, 70, 20, 5, 5, 10, 40, 75, 90],
  "snow-goose": [40, 60, 85, 55, 20, 5, 0, 0, 15, 55, 85, 70],
  "white-pelican": [0, 5, 20, 60, 80, 70, 60, 50, 30, 10, 5, 0]
};

const speciesKeys = ["sandhill-crane", "snow-goose", "white-pelican"];

let expanded = false;
let focusedSpecies = null;

/* FLOOD RENDER */

function renderFlood(){
  floodLayer.innerHTML = '';

  for(let i = 0; i < floodByMonth.length; i++){
    const bar = document.createElement('div');
    bar.className = 'flood-bar';
    bar.style.height = floodByMonth[i] + '%';
    floodLayer.appendChild(bar);
  }
}

/* AGGREGATE BIRDS (DEFAULT VIEW) */

function renderAggregateBirds(){
  birdLayer.innerHTML = '';
  birdLayer.className = 'timeline-layer bird-layer aggregate';

  focusedSpecies = null;

  for(let month = 0; month < 12; month++){
    let total = 0;

    for(let s = 0; s < speciesKeys.length; s++){
      const species = speciesKeys[s];
      total += birdsBySpecies[species][month];
    }

    const dot = document.createElement('div');
    dot.className = 'bird-dot';
    dot.style.transform = `translateY(${-total * 0.25}px)`;
    birdLayer.appendChild(dot);
  }

  expanded = false;
}

/* NESTED SPECIES VIEW */

function renderNestedBirds(){
  birdLayer.innerHTML = '';
  birdLayer.className = 'timeline-layer bird-layer expanded';

  for(let month = 0; month < 12; month++){
    const cluster = document.createElement('div');
    cluster.className = 'bird-cluster';

    for(let s = 0; s < speciesKeys.length; s++){
      const species = speciesKeys[s];
      const dot = document.createElement('div');

      dot.className = 'bird-dot ' + species;

      if(focusedSpecies && species !== focusedSpecies){
        dot.classList.add('dimmed');
      }

      dot.style.transform =
        `translateY(${-birdsBySpecies[species][month] * 0.3}px)`;

      cluster.appendChild(dot);
    }

    birdLayer.appendChild(cluster);
  }

  expanded = true;
}

/* INTERACTIONS */

/* toggle aggregate ↔ nested by clicking visualization */
birdLayer.addEventListener('click', () => {
  if(expanded && !focusedSpecies){
    renderAggregateBirds();
  } else {
    focusedSpecies = null;
    speciesItems.forEach(el => el.classList.remove('active'));
    renderAggregateBirds();
  }
});

/* sidebar species focus */
speciesItems.forEach(item => {
  item.addEventListener('click', () => {
    const species = item.dataset.species;

    if(focusedSpecies === species){
      focusedSpecies = null;
      speciesItems.forEach(el => el.classList.remove('active'));
      renderAggregateBirds();
      return;
    }

    focusedSpecies = species;
    speciesItems.forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    renderNestedBirds();
  });
});

/* INITIAL */

renderFlood();
renderAggregateBirds();
