
import React, {useState, useEffect} from 'react';
import ReactDom from 'react-dom';

function Dice(props){
  // Dice selected: true:  save dice, false: roll dice
  const [classes, setClasses] = useState("dice");
  const [path, setPath] = useState("./dices/dice-zero.png");  //require("./dices/dice-num.png")

  useEffect( ()=>{
    if (props.val===1){
      setPath("./dices/dice-one.png");
    } else if (props.val===2){
      setPath("./dices/dice-two.png")
    } else if (props.val===3){
      setPath("./dices/dice-three.png")
    } else if (props.val===4){
      setPath("./dices/dice-four.png")
    } else if (props.val===5){
      setPath("./dices/dice-five.png")
    } else if (props.val===6){
      setPath("./dices/dice-six.png")
    } else {
      setPath("./dices/dice-zero.png")
    }
  }, [props.val])

  useEffect( ()=> {
    setClasses( props.selected ? "dice selected" : "dice")
  }, [props.selected])
      
  // <img src={require(""+path)} alt={"Dice "+props.val} /> 
  return ( <>
		<span className={classes} onClick={props.onClick}> 
      <img src={require(""+path)} alt={"Dice "+props.val} /> 
    </span>
  </>)
}


// MAY 22:  ONCLICK DOESNT WORK
function SimpleDice(props){
  const [classes, setClasses] = useState("dice simpledice");
  
  useEffect( ()=> {
    setClasses( props.selected ? "dice simpledice selected" : "dice simpledice")
  }, [props.selected])
    
  return(<>
    {props.val===1?
      <span className={classes} onClick={props.onClick}> <a onClick={props.onClick} >&#x2680;</a> </span>
    : props.val===2 ?
      <span className={classes} onClick={props.onClick}> <a>&#x2681;</a> </span>
    : props.val===3 ?
      <span className={classes} onClick={props.onClick}> <a>&#x2682;</a> </span>
    : props.val===4 ?
      <span className={classes} onClick={props.onClick}> <a>&#x2683;</a> </span>
    : props.val===5 ?
      <span className={classes} onClick={props.onClick}> <a>&#x2684;</a> </span>
    : props.val===6 ?
      <span className={classes} onClick={props.onClick}> <a>&#x2685;</a> </span>
    :
      <span className={classes} onClick={props.onClick}> <a>&#x2685;</a> </span>
  }</>)
}


export default Dice;
