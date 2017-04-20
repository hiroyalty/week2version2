function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++)
        {
         hash = hashes[i].split('=');
         vars.push(hash[0]);
         vars[hash[0]] = hash[1];
         }

     return vars;
}

//function getinitvals() {
const getVals = getUrlVars();
const item_id = getVals['item_id'];
const title = getVals['title'];
//const details = (getVals['details'].replace(/%20/g, " "));
//const cleandetails = (details.replace(/[^a-zA-Z ]/g, ""));
const cleandetails = getVals['details'];
const category = getVals['category'];
const imgt = getVals['img'];
document.getElementById('itemId').value = item_id;
document.getElementById('updatecatname').value = title;
document.getElementById('updateDescription').value = cleandetails;
document.getElementById('updatecategory').value = category;
//document.getElementById('editimagelink').src = "files/uploads/" + imgt;

 //document.getElementById('updateform').action = '/updaterecord/'+ getElementById('itemId').value + '/' + getElementById('updatecatname').value + '/' + getElementById('updateDescription').value + '/' + getElementById('updatecategory').value;;
//}
function btntest_onclick() 
{
    window.location.href = "/";
}
function newpath() {
  document.getElementById('updateform').action = '/updaterecord/'+ getElementById('itemId').value + '/' + getElementById('updatecatname').value + '/' + getElementById('updateDescription').value + '/' + getElementById('updatecategory').value;
}