'use strict';

let originalData = null;

document.querySelector('#reset-button').addEventListener('click', () => {
    update(originalData);
});

const createCard = (image, title, text) => {
    return `<img class="card-img-top" src="files/uploads/${image}" alt="">
            <div class="card-block">
                <h3 class="card-title">${title}</h3>
                <p class="card-text">${text}</p>
            </div>
            <div class="card-footer">
                <p><button class="btn btn-primary">View</button></p>
            </div>`;
};

const categoryButtons = (items) => {
    items = removeDuplicates(items, 'category');
    console.log(items);
    document.querySelector('#categories').innerHTML = '';
    for (let item of items) {
        const button = document.createElement('button');
        button.class = 'btn btn-secondary';
        button.innerText = item.category;
        document.querySelector('#categories').appendChild(button);
        button.addEventListener('click', () => {
            sortItems(originalData, item.category);
        });
    }
};

const sortItems = (items, rule) => {
    const newItems = items.filter(item => item.category === rule);
    // console.log(newItems);
    update(newItems);
};

const myHeaders = new Headers({
  'Content-Type': 'text/plain',
});

const myInit = { method: 'GET',
               headers: myHeaders,
               cache: 'default',
				mode: 'no-cors' };

			   
const getData = () => { 
    fetch('listcats')
        .then((response) => {
			console.log('file loaded');
            return response.json();
        })
        .then((items) => {
            originalData = items;
            update(items);
        });

};

const removeDuplicates = (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

const update = (items) => {
    categoryButtons(items);
    document.querySelector('.card-deck').innerHTML = '';
    for (let item of items) {
        console.log(item);
        const article = document.createElement('article');
        article.setAttribute('class', 'card');

        article.innerHTML = createCard(item.thumbnail, item.title, item.details);
        article.addEventListener('click', () => {
            document.querySelector('.modal-body img').src = item.image;
            document.querySelector('.modal-title').innerHTML = item.title;
            $('#myModal').modal('show');
        });
        document.querySelector('.card-deck').appendChild(article);
    }
};

getData();