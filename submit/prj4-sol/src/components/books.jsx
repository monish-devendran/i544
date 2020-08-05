//-*- mode: rjsx-mode;

import React from 'react';
import book from "../lib/book";


export default class Books extends React.Component {

  constructor(props) {
    super(props);
    //@TODO other initialization
    this.state = {}
    this.getData = this.getData.bind(this)
  };

  //@TODO other methods
  getData(result){

    this.setState(result)
  }

  render(){
    //@TODO complete rendering
    return  (<div>
      <SearchForm app={this.props.app}  key="search" books = {this.getData}/>
      <Results app = {this.props.app} book={this.state}/>
    </div>);
  }
}

export function Book({book, full}) {

  //@TODO return rendering of book based on full
  let array = book.authors;
  let temp = [];
  for (const property in array) {
    const field = (array[property]).split(",")
    const author_name = field[1]+" "+field[0]
    temp.push(author_name)
  }
  if(temp.length >1){
    temp[temp.length-1] = "and "+temp[temp.length-1]
  }
  const authors = (temp.join()).replace(",and"," and")
  if(full){
    return <div className="book">
      <span className="title">{book.title}</span>
      <span className="authors">{authors}</span>
      <span className="isbn"><label>ISBN:</label>{book.isbn}</span>
      <span className="publisher">{book.publisher}</span>
      <span key="year" className="year">{book.year}, </span>
      <span className="pages">{book.pages} pages</span>
    </div>
  }
  else{
    return  <div className="book">
      <span className="title">{book.title}</span>
      <span className="authors">{authors}</span>
    </div>
  }

}


//@TODO other components like SearchForm, Results, etc.

class SearchForm extends React.Component{

  constructor(props) {
    super(props);
    //@TODO other initialization
    this.state = {
      search : ""
    }
    this.onBlur = this.onBlur.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  };

  async onBlur(event){
    const value = event.target.value;
    await this.searchBook(value)
  }

  async onSubmit(event){
    event.preventDefault();
    const element = event.target.querySelector("input");
    await this.searchBook(element.value)
  }

  async searchBook(props){
    const authorTitleSearch = (props || "").trim()

    if(authorTitleSearch && authorTitleSearch !== this.state.search){
      this.setState({search:authorTitleSearch})
    }
    if(authorTitleSearch !== ""){
      const result = await this.props.app.ws.findBooks(authorTitleSearch);

      this.props.books(result);
    }
  }

  render(){
    return (
        <form className="search" onSubmit={this.onSubmit}>
          <label htmlFor="search">Search Catalog</label>
          <input name="authorsTitleSearch" id="search"  onBlur={this.onBlur}/>
        </form>

    );
  }
}

const Results = ({app,book}) => {

  const data = book.result;
  const link = book.links;

  let dir;
  let content;
  const count = Object.keys(book).length;

  function addtoCart(bookSearchResult) {
    app.buy(bookSearchResult)
  }

  function browserClick() {
    event.preventDefault();
    console.log("ds")

  }
  if(count > 0) {
    return (

        <div>
          {
            data.map((bookSearchResult, i) => {
              return <div className="result" key={i}>
                <Book book={bookSearchResult} full={true}/>
                <div className="buy" onClick={() => addtoCart(bookSearchResult)}>
                  <button>Buy</button>
                </div>
              </div>
            })
          }
          {
            link.map((element)=>{
              if (element.rel === "next"){
                dir = "next"
                content = element
              }
              else if (element.rel === "prev"){
                dir = "prev"
              }
            })
          }
          <span className="scroll">
            <a href="#" rel={dir} onClick={() => browserClick(content)}>{SCROLLS[dir]}</a>
          </span>
        </div>
    )
  }else{
    return <div></div>;
  }
}


/** text for scroll controls */
const SCROLLS = {
  next: 'Next >>',
  prev: '<< Previous',
};
