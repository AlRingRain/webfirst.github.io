let myHeading = document.querySelector("h1");
myHeading.textContent = "Hello world!";

let iceCream = "chocolate";
if (iceCream === "chocolate") {
  alert("我最喜欢巧克力冰激淋了。");
} else {
  alert("但是巧克力才是我的最爱呀……");
}

let myImage = document.querySelector("img");

myImage.onclick = () => {
  let mySrc = myImage.getAttribute("src");
  if (mySrc === "images/firefox.png") {
    myImage.setAttribute("src", "images/bajie.png");
  } else {
    myImage.setAttribute("src", "images/firefox.png");
  }
};

let myButton = document.querySelector("button");

function setUserName() {
  let myName = prompt("请输入你的名字。");
  if (!myName) {
    setUserName();
  } else {
    localStorage.setItem("name", myName);
    myHeading.textContent = "Mozilla 酷毙了，" + myName;
  }
}

if (!localStorage.getItem("name")) {
  setUserName();
} else {
  let storedName = localStorage.getItem("name");
  myHeading.textContent = "Mozilla 酷毙了，" + storedName;
}

myButton.onclick = function () {
  setUserName();
};

// function multiply(num1, num2) {
//   let result = num1 * num2;
//   return result;
// }

// alert(multiply(4, 7));
// alert(multiply(20, 20));
// alert(multiply(0.5, 3));

// document.querySelector("html").addEventListener("click", () => {
//   alert("ahhhh")
// })

// document.querySelector("html").addEventListener("click", function () {
//   alert("别戳我，我怕疼。");
// });
