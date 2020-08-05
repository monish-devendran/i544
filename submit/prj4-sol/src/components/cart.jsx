//-*- mode: rjsx-mode;

import React from 'react';
import ReactDom from 'react-dom';

import { Book } from './books.jsx';

export default class Cart extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    //@TODO render cart by mapping LineItem over each item in props.items.

    return <LineItem item={this.props.items} app = {this.props.app}/>;
  }
}


class LineItem extends React.Component {

  constructor(props) {
    super(props);
    //@TODO
    this.onChange = this.onChange.bind(this)
  }

  //@TODO other methods
  onChange(book,event){
    this.props.app.update(book.book,event.target.value)
  }


  render() {
    const item = this.props.item

    //
    return  item.map((book,i)=>{
      ////
      const options = ["0 delete","1","2","3","4","5","6","7","8","9"];

      const select = options.map((value, i) => {
            return ( (book.nUnits == value) ?
                  <option key={value} value={i} selected>{value}</option>
                :
                  <option key={value} value={i}>{value}</option>
            )}, this);
      ////

      return( <div className="line-item">
        <Book book={book.book} full={false}/>
        <div className="nUnits"><label>Quantity</label><select  onChange={(e) => this.onChange(book,e)}>{select}</select></div>
      </div>)
    });
  }
}
