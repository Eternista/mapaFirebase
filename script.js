const placesMenu = document.querySelector('.fas');
placesMenu.addEventListener('click', () => {
  placesMenu.classList.toggle('active');
  document.querySelector('.places').classList.toggle('active');
})

//FIREBASE CONFIG

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDveXq4Fx1sQ9nQm-WCMg4Z--oIK6K5kbk",
    authDomain: "vacation-map-1b13d.firebaseapp.com",
    projectId: "vacation-map-1b13d",
    storageBucket: "vacation-map-1b13d.appspot.com",
    messagingSenderId: "833595704987",
    appId: "1:833595704987:web:e83cdb164e11c99c66283e"
  };
  // Initialize Firebase
  var app = firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore(app);
  db.settings({ timestampsInSnapshots: true});
//MAP

if (navigator.geolocation)
navigator.geolocation.getCurrentPosition(function(position) {
  const inputs = document.querySelectorAll('.form input');
  const whereInput = document.querySelector('.whereInput');
  const photoInput = document.querySelector('.photoInput');
  const costInput = document.querySelector('.costInput');
  const descInput = document.querySelector('.descInput');
  const placeLat = document.getElementById('lat');
  const placeLng = document.getElementById('lng');
  const add = document.querySelector('.submit');

  const {latitude} = position.coords;
  const {longitude} = position.coords;
  // console.log(latitude, longitude);
  var map = L.map('map').setView([latitude,longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([latitude, longitude]).addTo(map)
      .bindPopup('<span class="userLocalization">You are here!</span>')
      .openPopup();

    //GETTING INFO FROM MAP
    map.addEventListener('click', (e) => {

      const {lat} = e.latlng;
      const {lng} = e.latlng;
      placeLat.textContent = lat.toFixed(5);
      placeLng.textContent = lng.toFixed(5);
    })

    const info = document.querySelector('.info');

    //GET DATABASE
    const getDatabase = () => {
      document.querySelector('.places').innerHTML = "<h3>Vacation</h3>";
      db.collection("vacation").get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
          // console.log(doc.data());
        const li = document.createElement('li');
        document.querySelector('.places').appendChild(li);
        li.classList.add('place');
        li.addEventListener('click', (e) => {
          map.setView([doc.data().lat,doc.data().lng], 13);
        })
        const btn = document.createElement('button');
        btn.classList.add('liBtn');
        // <div class="cords">
        //         <span class="liLat">Lat: ${doc.data().lat}</span>
        //         <span class="liLng">Lng: ${doc.data().lng}</span>
        //     </div>
        li.innerHTML =
        `
          <div class="liContent">
            <p class="cityName"><span>City: </span><span>${doc.data().where}</span></p>
            <p class="liCost"><span>Cost: </span><span>${doc.data().cost}$/Day</span></p>
          </div>
        `;
        li.appendChild(btn);
        btn.innerHTML = 'info';
        btn.addEventListener('click', () => {
          info.classList.remove('hidden');
          placesMenu.classList.remove('active');
          document.querySelector('.places').classList.remove('active');
          info.innerHTML =
          `<div class="mainInfo">
              <img src="${doc.data().photo}">
              <div class="infoContent">
                <h2>${doc.data().where}</h2>
                <p>${doc.data().desc}</p>
              </div>
            </div>
          `
          const close = document.createElement('span');
          close.classList.add('close');
          close.innerHTML = 'x';
          info.childNodes[0].appendChild(close);
          info.addEventListener('click', (e) => {
            if(e.target.classList.contains('info')) {
              e.target.classList.add('hidden');
            }
          })
          close.addEventListener('click', () => {
            info.classList.add('hidden');
          })
        })
        L.marker([doc.data().lat, doc.data().lng]).addTo(map)
        .bindPopup(`<div class="popUp"><img src="${doc.data().photo}"><div class="popUp-content"><span>${doc.data().where}: </span> <span>${doc.data().cost}$/Day</span></div></div>`)
        .openPopup();
        })
      })
    }
    getDatabase();
    //ADD TO DATABASE

    // photoInput.addEventListener('change', () => {
    //   const onFileChange = (e) => {
    //     const file = e.target.files[0];
    //     const storageRef = app.storage().ref();
    //     const fileRef = storageRef.child(file.name);
    //     fileRef.put()
    //   }
    // })

    add.addEventListener('click', (e) => {
      e.preventDefault();
      if(whereInput.value === "" || costInput.value === "" || descInput.value === ""|| !photoInput.files[0].name.match(/.(jpg|jpeg|png|gif)$/i) || placeLat.textContent === "none" || placeLng.textContent === "none") {
        alert("Some of input's are empty or you don't click the map");
        document.querySelectorAll('.input').forEach(single => {
          if(single.value === '' || single.textContent ==="none") {
            single.classList.add('wrong');
          }else {
            single.classList.remove('wrong');
          }
        })
      } else {
        document.querySelectorAll('.input').forEach(single => {
          single.classList.remove('wrong');
        })

        const onFileChange = async () => {
          const file = photoInput.files[0];
          const storageRef = firebase.storage().ref();
          const fileRef = storageRef.child(file.name);
          await fileRef.put(file).then(() => {
            console.log("Uploaded file", file.name);
          })
          // firebase.storage.ref(file.name).getDownloadURL().then(function(url) {
          // })
          firebase.storage().ref(file.name).getDownloadURL()
          .then((url) => {
            db.collection("vacation").doc().set({
              photo: `${url}`,
              where: whereInput.value,
              cost: Number(costInput.value),
              lng: Number(placeLng.textContent),
              lat: Number(placeLat.textContent),
              desc: descInput.value,
            })
            .then(() => {
                console.log("Document successfully written!");
                inputs.forEach(input => {
                  input.value = "";
                })
                placeLng.textContent = "none";
                placeLat.textContent = "none";
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
            getDatabase();
          })
          // const fileUrl = await fileRef.getDownloadUrl();
        }
        onFileChange();
      }
    })

}, function() {
  alert('Could not get your position');
})