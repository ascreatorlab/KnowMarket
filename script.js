// ===== 1. APIs Config =====

const DATA_API_URL =
"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000013a00e18ef65d4b0063eac2e34ced0b9f&format=json&limit=100";

const SARVAM_API_KEY = "sk_1mgjxi7g_hvKLJt06v3x4aoFcv1SBI7UD";

let marketData = [];


// ===== CATEGORY DETECT =====

function detectCategory(name){

name = name.toLowerCase();

const vegetables = ["tomato","potato","onion","pumpkin","spinach","cabbage","bitter gourd","bhindi","bottle gourd"];
const grains = ["rice","wheat","maize","barley","gram"];

if(vegetables.includes(name)) return "Vegetables";
if(grains.includes(name)) return "Grains";

return "Others";

}


// ===== REMOVE DUPLICATES =====

function removeDuplicates(data){

const map = {};

data.forEach(item=>{

if(!map[item.name]){
map[item.name] = [];
}

map[item.name].push(Number(item.price));

});

const result = [];

for(const key in map){

const prices = map[key];

const avg =
prices.reduce((a,b)=>a+b,0) / prices.length;

result.push({

name:key,
price:avg.toFixed(2),
unit:"kg",
category:detectCategory(key),
trend:"Stable"

});

}

return result;

}


// ===== RENDER ITEMS =====

function renderItems(data){

const grid = document.getElementById("itemsGrid");

grid.innerHTML = "";

if(!data || data.length === 0){

grid.innerHTML =
`<div style="text-align:center;padding:40px;color:#b2bec3;">
No data available
</div>`;

return;

}

data.forEach(item=>{

grid.innerHTML +=

`<div class="card">

<div class="item-info">
<span class="title">${item.name}</span>
<small style="color:#b2bec3;">${item.category}</small>
</div>

<div class="price-section">
<span class="price-val">₹${item.price}</span>
<small class="unit-text">/${item.unit}</small>
<div class="trend-down">
${item.trend}
</div>
</div>

</div>`;

});

document.getElementById("last-update-time")
.innerText = new Date().toLocaleTimeString();

}


// ===== FETCH DATA =====

async function fetchLivePrices(){

try{

const response = await fetch(DATA_API_URL);

const data = await response.json();

const rawData = (data.records || []).map(item=>({

name:item.commodity,
price:(item.modal_price/100).toFixed(2)

}));

marketData = removeDuplicates(rawData);

renderItems(marketData);

}
catch(error){

console.error(error);

document.getElementById("itemsGrid").innerHTML =
"Data load nahi ho paya ⚠️";

}

}


// ===== AI CHAT =====

async function askAI(userQuery){

const chatBody =
document.getElementById("chatBody");

const context =
marketData.map(item=>
`${item.name}: ₹${item.price}/kg`
).join(", ");

try{

const response = await fetch(
"https://api.sarvam.ai/v1/chat/completions",
{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${SARVAM_API_KEY}`
},

body:JSON.stringify({

model:"sarvam-m",

messages:[
{
role:"system",
content:"You are a mandi market expert. Answer in Hinglish."
},
{
role:"user",
content:`${userQuery}

Current prices:
${context}`
}
]

})

});

const data = await response.json();

let aiText="AI response nahi mila";

if(data.choices){

aiText = data.choices[0].message.content;

}

chatBody.innerHTML +=
`<div class="ai-msg">${aiText}</div>`;

chatBody.scrollTop =
chatBody.scrollHeight;

}
catch(e){

chatBody.innerHTML +=
`<div class="ai-msg">
AI connection problem
</div>`;

}

}


// ===== PAGE LOAD =====

document.addEventListener("DOMContentLoaded",()=>{

fetchLivePrices();


// ===== MAP =====

const map =
L.map("mapContainer")
.setView([26.8018,84.5037],13);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{maxZoom:19}
).addTo(map);

let marker =
L.marker([26.8018,84.5037])
.addTo(map)
.bindPopup("Bettiah Mandi")
.openPopup();


// ===== MAP CLICK =====

map.on("click",(e)=>{

const lat = e.latlng.lat;
const lng = e.latlng.lng;

marker.setLatLng([lat,lng]);

});


// ===== LOCATION UPDATE =====

document.getElementById("update-loc")
.onclick = ()=>{

navigator.geolocation.getCurrentPosition(pos=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

map.setView([lat,lng],13);

marker.setLatLng([lat,lng]);

document.getElementById("loc-text")
.innerText = "Current Location";

});

};


// ===== SEARCH =====

document
.getElementById("searchInput")
.addEventListener("input",(e)=>{

const term =
e.target.value.toLowerCase();

const filtered =
marketData.filter(item=>
item.name.toLowerCase().includes(term)
);

renderItems(filtered);

});


// ===== CATEGORY =====

document
.getElementById("categoryBar")
.onclick = (e)=>{

if(e.target.classList.contains("chip")){

document
.querySelector(".chip.active")
.classList.remove("active");

e.target.classList.add("active");

const cat = e.target.innerText;

const filtered =
cat==="All Items"
?marketData
:marketData.filter(i=>i.category===cat);

renderItems(filtered);

}

};


// ===== AI MODAL =====

const modal =
document.getElementById("aiModal");

document
.getElementById("aiTrigger")
.onclick=()=>{
modal.style.display="block";
};

document
.querySelector(".close-modal")
.onclick=()=>{
modal.style.display="none";
};


// ===== SEND AI =====

document
.getElementById("sendQuery")
.onclick=()=>{

const input =
document.getElementById("aiQuery");

const chatBody =
document.getElementById("chatBody");

if(input.value.trim()==="")
return;

chatBody.innerHTML +=
`<div class="user-msg">${input.value}</div>`;

askAI(input.value);

input.value="";

};

});


// ===== AUTO REFRESH =====

setInterval(()=>{

fetchLivePrices();

},30000);
