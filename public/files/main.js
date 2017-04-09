'use strict';

let originalData = null;
let map = null;
let marker = null;
let editablecat = null;

document.querySelector('#reset-button').addEventListener('click', () => {
    update(originalData);
});

const createCard = (image, title, text) => {
    return `<img class="card-img-top" src="files/uploads/${image}" alt="">
            <div class="card-block">
                <h3 class="card-title">${title}</h3>
                <p class="card-text">${text}</p>
            </div>
            `;
};
const viewFooting = (id) => {
	return `<div class="card-footer">
                <button class="btn btn-primary btn-sm" id="seemore">View</button>
            </div>`;
};

const updateFooting = () => {
	return `<div class="card-footer">
				<button type="button" class="btn btn-secondary btn-sm" id="updatecard" name="updatecard">Update</button>
            </div>`;
};

const deleteFooting = (id) => {
	return `<div class="card-footer">
				<button type="button" class="btn btn-success btn-sm" id="deletecard" name="deletecard">Delete</button>
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
		const viewleg = document.createElement('viewleg');
		const updateleg = document.createElement('updateleg');
		const deleteleg = document.createElement('deleteleg');
		
        article.setAttribute('class', 'card');
		
        article.innerHTML = createCard(item.thumbnail, item.title, item.details);
        article.addEventListener('click', () => {
            document.querySelector('.modal-body img').src = item.image;
            document.querySelector('.modal-title').innerHTML = item.title;
            $('#myModal').modal('show');
        });
		viewleg.innerHTML = viewFooting(item._id);
		updateleg.innerHTML = updateFooting();
		deleteleg.innerHTML = deleteFooting(item._id);
		
		viewleg.addEventListener('click', () => {
			console.log('clicked');
			alert('clicked view'+ item._id);
        });
		updateleg.addEventListener('click', () => {
			//console.log('clicked');
			//alert('clicked update'+ item._id);
			editablecat = item;
			//alert('editablecat'+ JSON.stringify(editablecat));
			//loadonecat(item._id);
			window.location.href = "/viewone.html";
		});
		deleteleg.addEventListener('click', () => {
			
			deleteData(item._id);
        });
		
		article.appendChild(viewleg);
		article.appendChild(updateleg);
		article.appendChild(deleteleg);
        document.querySelector('.card-deck').appendChild(article);
    }
};
const loadonecat = () => {
	//const urlu = 'editcat/'+item;
	//fetch(urlu)
	//.then((response) => {
    //       return response.json();
    //  })
	alert('editablecat'+ JSON.stringify(editablecat));
	window.onload = function(){
	document.getElementById('#updatecatname').value = editablecat.title;
	document.getElementById('#updateInputCatDescription').value = editablecat.details;
	document.getElementById('#updatecategory').value = editablecat.category;
};
};

const deleteData = (itemid) => {
    const url = 'delete/'+itemid;
	fetch(url)
	.then((response) => {
            return response.json();
        })
        .then(() => {
            getData();
        });
};

	window.onload = function(){
	document.getElementById('#updatecatname').value = "ginger";
	document.getElementById('#updateInputCatDescription').value = editablecat.details;
	document.getElementById('#updatecategory').value = editablecat.category;
	};
getData();
//loadonecat();