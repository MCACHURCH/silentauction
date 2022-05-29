// For a real auction, set this to false
let demoAuction = false;
// For a real auction, populate these arrays
let primaryImages = [
  "https://cdn.discordapp.com/attachments/980376991515688980/980377056988790795/balls_table.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377056690991154/Flower.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377056418332692/Jellyfish_table.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377056187662336/Jill_carter_painting.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377055944384552/racoon.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377055701139506/Red_face_table.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377055185207328/Vietnamese_landscape_table.jpg",
  "https://cdn.discordapp.com/attachments/980376991515688980/980377054912581642/white_flower_table.jpg",
  "https://cdn.discordapp.com/attachments/979971450368847874/980407359409094676/Lanna_Dang_-_Starry_Night.jpg",
  "https://cdn.discordapp.com/attachments/979971450368847874/980426820744802344/IMG_5616.png",
];
let titles = [
  "Umbrellas",
  "White Lotus",
  "Jellyfish",
  "Collage",
  "Racoon",
  "Self Portrait",
  "Rice Terrace",
  "Hoa Quynh",
  "Starry Sea",
  "Angel vs Devil",
];

let startingPrices = [
  750000, 
  1000000,
  0, 
  500000, 
  300000, 
  1000000,
  300000, 
  1500000, 
  500000,
  750000,
];

let authors = [
  "Julia",
  "Nguyen Huong Giang",
  "Unknown",
  "Ms. Carter",
  "Lanna Dang",
  "Brianna Nguyen",
  "Lanna Dang",
  "Brianna Nguyen",
  "Lanna Dang",
  "Gaby"
];
let details = [
  "So what if you are you? Even if others around you may muddle into grey patches, black turned white, you burn red. Memories and experiences contribute to who you are today, but a red umbrella is still a red umbrella.",
  "The trio of white lotus represent the breath-taking beauty of nature. Lotus are the national flower of Vietnam which symbolize the Vietnamese woman: Pureness.  The white lotus flower is also known to symbolize Bodhi (being awakened), and represents a state of mental purity, and that of spiritual perfection; it is also associated with the pacification of one's nature. This lotus is considered to be the womb of the world.",
  "",
  "",
  "Sketch of a raccoon on silver scratch pad.",
  "This is a self-portrait done in oil paint that describes the sense of not being one’s self. When your physical body doesn’t align with your spiritual and the visage you observe from the mirror feels like looking at a stranger in the street.",
  "A recreation of Vietnam most iconic scenery using chalk pastel.",
  "This piece discovers womanhood within femininity symbols in Vietnamese culture through the topic of virginity and being pristine. It calls out the stigmatism that’s attached to being a woman with sexual desires and wants described through the crushed petals. Although it may seem that desire ruined the flower’s purity and beauty, the true destructor is judgement and prejudice. Despite the crushed petals, this Hoa Quynh still stands delicate, yet strong with her alluring appeal.",
  "This piece depicts a figure on the back of a whale swimming through a sea of clouds. When making this piece, I wanted it to convey ideas of escapism and daydreaming. To the viewer, I want to emphasize the importance of dreaming and letting that dream seep beyond that mental threshold and into reality.",
  `"The angel spread their wings around me,
  A divine messenger,
  Protecting me from evil spirits,
  They guide me to where there is light.
  The devil whispers in my ear,
  Words full of seduction,
  Preying on my soul,
  They lure me into the darkness."`,
];

let endTimes = [];
for (let i = 0; i < startingPrices.length; i++) {
  endTimes.push(1654020275)
}

// Initial state of auction, used for resetting database
let startPrices = [];
for (let i = 0; i < startingPrices.length; i++) {
  startPrices.push({
    bid0: {
      bidder: String(i),
      amount: startingPrices[i],
      time: Date().substring(0, 24)
    }
  })
}

// Convert time to string for HTML clocks
function timeBetween(start, end) {
  let _string = ""
  let secsRemaining = (end - start) / 1000;
  let d = parseInt(secsRemaining / 86400);
  let h = parseInt(secsRemaining % 86400 / 3600);
  let m = parseInt(secsRemaining % 3600 / 60);
  let s = parseInt(secsRemaining % 60);
  if (d) { _string = _string + d + "d " }
  if (h) { _string = _string + h + "h " }
  if (m) { _string = _string + m + "m " }
  if (s) { _string = _string + s + "s " }
  return _string.trim()
}

// Place a bid on an item
function placeBid() {
  let nowTime = new Date().getTime();
  let modalBidButton = document.querySelector("#bid-modal > div > div > div.modal-footer > button.btn.btn-primary")
  modalBidButton.setAttribute('disabled', '') // disable the button while we check
  let i = modalBidButton.id.match("[0-9]+");
  let feedback = document.getElementById("bad-amount-feedback")
  // Cleanse input
  let amountElement = document.getElementById("amount-input")
  let amount = Number(amountElement.value)
  if (amount == 0) {
    // amount was empty
    feedback.innerText = "Please specify an amount!"
    amountElement.classList.add("is-invalid")
    modalBidButton.removeAttribute('disabled', '');
  } else if (!(/^-?\d*\.?\d{0,2}$/.test(amount))) {
    // field is does not contain money
    feedback.innerText = "Please specify a valid amount!"
    amountElement.classList.add("is-invalid")
    modalBidButton.removeAttribute('disabled', '');
  } else {
    // Checking bid amount
    // Get item and user info
    let user = auth.currentUser;
    let itemId = i.toString().padStart(5, "0")
    // Documents to check and write to
    let liveRef = db.collection("auction-live").doc("items")
    let storeRef = db.collection("auction-store").doc(itemId)
    // Check live document
    liveRef.get().then(function (doc) {
      console.log("Database read from placeBid()")
      let thisItem = doc.data()[itemId];
      let bids = (Object.keys(thisItem).length - 1) / 2
      let currentBid = thisItem["bid" + bids]
      if (amount >= 10000 + currentBid) {
        keyStem = itemId + ".bid" + (bids + 1)
        liveRef.update({
          [keyStem + "-uid"]: user.uid,
          [keyStem]: amount,
        })
        console.log("Database write from placeBid()")
        storeKey = "bid" + (bids + 1)
        storeRef.update({
          [storeKey]: {
            "bidder-username": user.displayName,
            "bidder-uid": user.uid,
            "amount": amount,
            time: Date().substring(0, 24)
          }
        })
        console.log("Database write from placeBid()")
        amountElement.classList.add("is-valid")
        amountElement.classList.remove("is-invalid")
        setTimeout(() => {
          bidModal.hide();
          amountElement.classList.remove("is-valid");
          modalBidButton.removeAttribute('disabled', '');
        }, 1000);
      } else {
        amountElement.classList.add("is-invalid")
        feedback.innerText = "You must bid at least " + numberWithCommas(currentBid + 10000) + " VND!"
        modalBidButton.removeAttribute('disabled', '');
      }
    });
  }
}

function argsort(array) {
  const arrayObject = array.map((value, idx) => { return { value, idx }; });
  arrayObject.sort((a, b) => (a.value - b.value))
  return arrayObject.map(data => data.idx);;
}

function generateAuctionCard(i) {
  // create auction card
  let col = document.createElement("div");
  col.classList.add("col");

  let card = document.createElement("div");
  card.classList.add("card");
  card.id = "auction-" + i
  console.log("card done");
  col.appendChild(card);

  let image = document.createElement("img");
  image.classList.add("card-img-top");
  image.src = primaryImages[i];
  console.log("images done");
  card.appendChild(image);

  let body = document.createElement("div");
  body.classList.add("card-body");
  card.appendChild(body);

  let title = document.createElement("h5");
  title.classList.add("title");
  console.log("title done");
  title.innerText = titles[i];
  body.appendChild(title);

  let subtitle = document.createElement("p");
  subtitle.classList.add("card-subtitle");
  console.log("subtitle done");
  subtitle.innerText = "By: " + authors[i];
  body.appendChild(subtitle);

  // Auction status
  let statusTable = document.createElement("table");
  statusTable.classList.add("table");
  console.log("table done");
  card.appendChild(statusTable);

  let tableBody = document.createElement("tbody");
  statusTable.appendChild(tableBody);

  let bidRow = document.createElement("tr");
  tableBody.appendChild(bidRow);

  let bidTitle = document.createElement("th");
  bidTitle.innerHTML = "Current bid:"
  bidTitle.scope = "row";
  bidRow.appendChild(bidTitle);

  let bid = document.createElement("td");
  bid.innerHTML = "-- VND [- bids]"
  bid.id = "current-bid-" + i
  bidRow.appendChild(bid);

  // Auction actions
  let buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");
  card.appendChild(buttonGroup)

  let infoButton = document.createElement("button");
  infoButton.type = "button"
  infoButton.href = "#";
  infoButton.classList.add("btn", "btn-secondary")
  infoButton.innerText = "Details";
  infoButton.onclick = function () { openInfo(this.id); }
  infoButton.id = "info-button-" + i
  buttonGroup.appendChild(infoButton);

  let bidButton = document.createElement("button");
  bidButton.type = "button"
  bidButton.href = "#";
  bidButton.classList.add("btn", "btn-primary")
  bidButton.innerText = "Submit bid";
  bidButton.onclick = function () { openBid(this.id); }
  bidButton.id = "bid-button-" + i
  buttonGroup.appendChild(bidButton);

  return col
}

// Generatively populate the websire with auctions
function populateAuctionGrid() {
  auctionGrid = document.getElementById("auction-grid");
  let endingSoonest = argsort(endTimes);
  endingSoonest.forEach((i) => {
    auctionCard = generateAuctionCard(i);
    console.log("populated grid");
    auctionGrid.appendChild(auctionCard);
  });
  if (demoAuction) { generateRandomAuctions() };
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dataListener() {
  // Listen for updates in active auctions
  db.collection("auction-live").doc("items").onSnapshot(function (doc) {
    console.log("Database read from dataListener()")
    let data = doc.data()
    for (key in data) {
      let cb = document.getElementById("current-bid-" + Number(key))
      let bids = data[key]
      // Extract bid data
      let bidCount = (Object.keys(bids).length - 1) / 2
      let currPound = Number.parseInt(bids["bid" + bidCount])
      // Check if the user is winning
      if (auth.currentUser) {
        let userWinning = bids["bid" + bidCount + "-user"] == auth.currentUser.uid
      }
      // Add bid data to HTML
      cb.innerHTML = numberWithCommas(currPound) + " VND" + " [" + bidCount + " bid" + (bidCount != 1 ? "s" : "") + "]"
    }
  })
}

function resetLive(i) {
  let docRef = db.collection("auction-live").doc("items");
  let itemId = i.toString().padStart(5, "0")
  docRef.update({
    [itemId]: {
      title: titles[i],
      bid0: startPrices[i]["bid0"]["amount"],
    }
  })
  console.log("Database write from resetLive()")
}

function resetAllLive() {
  console.log("Resetting live tracker")
  for (i = 0; i < startingPrices.length; i++) {
    resetLive(i);
  }
}

function resetStore(i) {
  let itemId = i.toString().padStart(5, "0")
  let docRef = db.collection("auction-store").doc(itemId);
  docRef.set(startPrices[i])
  console.log("Database write from resetStore()")
}

function resetAllStore() {
  console.log("Resetting auction storage")
  let batch = db.batch();
  for (i = 0; i < startingPrices.length; i++) {
    let itemId = i.toString().padStart(5, "0")
    let currentItem = db.collection("auction-store").doc(itemId);
    batch.set(currentItem, startPrices[i])
  }
  batch.commit()
  console.log(startingPrices.length + " database writes from resetAllStore()")
}

function resetAll() {
  resetAllLive();
  resetAllStore();
}
