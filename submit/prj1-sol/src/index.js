import './style.css';

import $ from 'jquery';        //make jquery() available as $
import Meta from './meta.js';  //bundle the input to this program

//default values
const DEFAULT_REF = '_';       //use this if no ref query param
const N_UNI_SELECT = 4;        //switching threshold between radio & select
const N_MULTI_SELECT = 4;      //switching threshold between checkbox & select

/*************************** Utility Routines **************************/

/** Return `ref` query parameter from window.location */
function getRef() {
  const url = new URL(window.location);
  const params = url.searchParams;
  return params && params.get('ref');
}

/** Return window.location url with `ref` query parameter set to `ref` */
function makeRefUrl(ref) {
  const url = new URL(window.location);
  url.searchParams.set('ref', ref);
  return url.toString();
}

/** Return a jquery-wrapped element for tag and attr */
function makeElement(tag, attr={}) {

  const $e = $(`<${tag}/>`);

  Object.entries(attr).forEach(([k, v]) => $e.attr(k, v));
  
  return $e;
}

/** Given a list path of accessors, return Meta[path].  Handle
 *  occurrences of '.' and '..' within path.
 */
function access(path) {
  const normalized = path.reduce((acc, p) => {
    if (p === '.') {
      return acc;
    }
    else if (p === '..') {
      return acc.length === 0 ? acc : acc.slice(0, -1)
    }
    else {
      return acc.concat(p);
    }
  }, []);
  return normalized.reduce((m, p) => m[p], Meta);
}

/** Return an id constructed from list path */
function makeId(path) { return ('/' + path.join('/')); }

function getType(meta) {
  return meta.type || 'block';
}

/** Return a jquery-wrapped element <tag meta.attr>items</tag>
 *  where items are the recursive rendering of meta.items.
 *  The returned element is also appended to $element.
 */
function items(tag, meta, path, $element) {

  const $e = makeElement(tag, meta.attr);

  (meta.items || []).
    forEach((item, i) =>render(path.concat('items', i), $e));
  $element.append($e);
  
  return $e;
}

/************************** Event Handlers *****************************/

//@TODO
function makeOptions(meta,idx){

  const $options = makeElement('option',{"value": meta.items[idx].key}).text(meta.items[idx].text)
  return $options

}

function dataManuplators(data) {


}
/********************** Type Routine Common Handling *******************/

//@TODO
function on() {

}

/***************************** Type Routines ***************************/

//A type handling function has the signature (meta, path, $element) =>
//void.  It will append the HTML corresponding to meta (which is
//Meta[path]) to $element.

function block(meta, path, $element) { items('div', meta, path, $element); }



function form(meta, path, $element) {


  const $form = items('form', meta, path, $element);
  
  
  $form.submit(function(event) {
    event.preventDefault();
    const $form = $(this);
    //@TODO
    const results = $form.serializeArray();
    let data = {};
    for (let i=0; i<results.length; i++) {
      var temp = $('[name=' + results[i].name + ']', $form);
      ($(temp).attr("multiple") || $(temp).attr("type") === "checkbox") ? ((data[results[i].name]) ? data[results[i].name].push(results[i].value) : data[results[i].name] = [results[i].value]) : data[results[i].name] = results[i].value
    }
    console.log(JSON.stringify(data, null, 2));
  });
}

function header(meta, path, $element) {
  const $e = makeElement(`h${meta.level || 1}`, meta.attr);
  $e.text(meta.text || '');
  $element.append($e);
}

function input(meta, path, $element) {
  //@TODO


  const $path = makeId(path);
  const forAttr = {"for":$path}
  const $e = makeElement(`label`, forAttr);
  if(meta.required === true){
    $element.append($e.text(meta.text+"*"));
  }else{
    $element.append($e.text(meta.text));
  }
  let type_assign;
  if(meta.subType === undefined){

    type_assign = {"id":$path,"type":"text"};
  }else{
    type_assign = {"id":$path,"type":meta.subType};
  }
  
  Object.assign(meta.attr,type_assign);
   

  const $div =  makeElement('div',{})
  const $input = items('input', meta, path, $element);
  $div.append($input);
  if(meta.required){
    const $errorDiv = makeElement('div',{"class":"error","id":$path+"-err"})
    $div.append($errorDiv);
    $input.blur(function () {
      onBlur(this,meta);
    });
  }

  $element.append($div)
}

function onBlur(ele,meta)
{
  var text_val = $(ele).val()
  if($(ele).val().trim())
  {
    var val = text_val.trim();
    if(meta.chkFn(val) === null){
      $(ele).next().text(meta.errMsgFn(Event,meta))
    }else{
      $(ele).next().text("");
    }
  }
  else
  {
    $(ele).next().text("The field "+meta.text+" must be specified.");
    //console.log(meta.errMsgFn(Event,meta))
  }
}

function link(meta, path, $element) {
  const parentType = getType(access(path.concat('..')));
  const { text='', ref=DEFAULT_REF } = meta;
  const attr = Object.assign({}, meta.attr||{}, { href: makeRefUrl(ref) });
  $element.append(makeElement('a', attr).text(text));
}

function multiSelect(meta, path, $element) {
  //@TODO

  const text = (meta.required) ? meta.text+"*" : meta.text;

  const $path = makeId(path);
  const forAttr = {"for":$path}
  const $e = makeElement('label',forAttr).text(text);
  $element.append($e)
  const $div = makeElement('div',{})
  if(meta.items.length > (N_MULTI_SELECT || 6) ){

    meta.attr.multiple = "multiple"
    const $multiSelect = makeElement('select',meta.attr)
    for(let i=0; i<meta.items.length; i++){
      let $getOptions = makeOptions(meta,i)

      $multiSelect.append($getOptions)
    }
    $div.append($multiSelect)
  }else{

    const $divfield = makeElement('div',{"class":"fieldset"})
    for(let i=0; i<meta.items.length; i++){
      Object.assign(meta.attr, {"id":$path+"-"+i,"type":"checkbox","value":meta.items[i].key})

      const $label = makeElement('label',{"for":$path}).text(meta.items[i].key)
      const $checkbox_input = makeElement('input',meta.attr)
      $divfield.append($label)
      $divfield.append($checkbox_input)
    }
    $div.append($divfield)
  
  }
  const $divError = makeElement('div',{"class":"error","id":$path+"-err"})
  $div.append($divError)
  $element.append($div)
}

function para(meta, path, $element) { items('p', meta, path, $element); }

function segment(meta, path, $element) {
  if (meta.text !== undefined) {
    $element.append(makeElement('span', meta.attr).text(meta.text));

  }
  else {
    items('span', meta, path, $element);
  }
}


function submit(meta, path, $element) {
  //@TODO
  const $div = makeElement('div',{})
  $element.append($div)

  const typeSubmit = Object.assign({},meta.attr,{"type":"submit"})

  
  const $button = makeElement('button',typeSubmit).text(meta.text || 'submit');
  $element.append($button)

}

function uniSelect(meta, path, $element) {
  //@TODO


  const text = (meta.required) ? meta.text+"*" : meta.text;

  const $path = makeId(path);
  const forAttr = {"for":$path}
  const $e = makeElement('label',forAttr).text(text);
  $element.append($e) //showing this to web

  const $div = makeElement('div',{})
  const $divErr = makeElement('div',{"class":"error","id":$path+"-err"})

  if(meta.items.length > (N_UNI_SELECT || 4)){

    const $select = makeElement('select',meta.attr)

    for(let i=0; i<meta.items.length; i++){
      let $getOptions = makeOptions(meta,i)

      $select.append($getOptions)
      
    }

    $div.append($select)
      $div.append($divErr)

  }else{
    const $divfield = makeElement('div',{"class":"fieldset"})

    for(let i=0; i<meta.items.length; i++){


      Object.assign(meta.attr, {"id":$path+"-"+i,"type":"radio","value":meta.items[i].key})

      const $label = makeElement('label',{"for":$path}).text(meta.items[i].key)
      const $radio_input = makeElement('input',meta.attr)
      $divfield.append($label)
      $divfield.append($radio_input)

    }
    $div.append($divfield)
  }
  $element.append($div) //showing
 

}


//map from type to type handling function.  
const FNS = {
  block,
  form,
  header,
  input,
  link,
  multiSelect,
  para,
  segment,
  submit,
  uniSelect,
};

/*************************** Top-Level Code ****************************/

function render(path, $element=$('body')) {

  const meta = access(path);
  if (!meta) {
    $element.append(`<p>Path ${makeId(path)} not found</p>`);
  }
  else {
    const type = getType(meta);
    const fn = FNS[type];
    if (fn) {
      fn(meta, path, $element);
    }
    else {
      $element.append(`<p>type ${type} not supported</p>`);
    }
  }
}

function go() {
  const ref = getRef() || DEFAULT_REF;
  render([ ref ]);
}

go();