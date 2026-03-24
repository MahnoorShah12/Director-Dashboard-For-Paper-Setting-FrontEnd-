import React, { useState } from "react";
import {
View,
Text,
Modal,
StyleSheet,
TouchableOpacity,
ScrollView
} from "react-native";

const ReorderQuestionsModal = ({ visible, questions, onClose, onSave }) => {

const [localQuestions, setLocalQuestions] = useState([...questions]);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const saveToHistory = (newQuestions) => {

const newHistory = history.slice(0, historyIndex + 1);
newHistory.push([...localQuestions]);

setHistory(newHistory);
setHistoryIndex(newHistory.length - 1);
setLocalQuestions(newQuestions);

};

const moveUp = (index) => {

if(index === 0) return;

const newQuestions = [...localQuestions];

[newQuestions[index-1], newQuestions[index]] =
[newQuestions[index], newQuestions[index-1]];

saveToHistory(newQuestions);

};

const moveDown = (index) => {

if(index === localQuestions.length-1) return;

const newQuestions = [...localQuestions];

[newQuestions[index], newQuestions[index+1]] =
[newQuestions[index+1], newQuestions[index]];

saveToHistory(newQuestions);

};

const handleUndo = () => {

if(historyIndex > 0){

setHistoryIndex(historyIndex-1);
setLocalQuestions(history[historyIndex-1]);

}
else if(historyIndex === 0){

setHistoryIndex(-1);
setLocalQuestions(questions);

}

};

const handleRedo = () => {

if(historyIndex < history.length-1){

setHistoryIndex(historyIndex+1);
setLocalQuestions(history[historyIndex+1]);

}

};

const canUndo = historyIndex >= 0;
const canRedo = historyIndex < history.length-1;

const getDifficultyColor = (difficulty)=>{

switch(difficulty?.toLowerCase()){

case "easy":
return {bg:"#e6f7e6", color:"#2e7d32"};

case "medium":
return {bg:"#fff3e0", color:"#b85e00"};

case "hard":
return {bg:"#ffebee", color:"#c62828"};

default:
return {bg:"#f5f5f5", color:"#616161"};

}

};

return(

<Modal visible={visible} transparent animationType="fade">

<View style={styles.overlay}>

<View style={styles.modal}>

{/* Header */}

<View style={styles.header}>

<View style={styles.headerLeft}>

<Text style={styles.title}>Reorder Questions</Text>

<Text style={styles.badge}>
{localQuestions.length} items
</Text>

</View>

<View style={styles.headerRight}>

<TouchableOpacity
disabled={!canUndo}
onPress={handleUndo}
style={[styles.smallBtn,!canUndo && styles.disabled]}
>
<Text>Undo</Text>
</TouchableOpacity>

<TouchableOpacity
disabled={!canRedo}
onPress={handleRedo}
style={[styles.smallBtn,!canRedo && styles.disabled]}
>
<Text>Redo</Text>
</TouchableOpacity>

<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
<Text style={{color:"#fff"}}>X</Text>
</TouchableOpacity>

</View>

</View>

{/* Content */}

<ScrollView style={styles.content}>

{localQuestions.map((q,index)=>{

const diff = getDifficultyColor(q.Difficulty);

return(

<View key={q.Id} style={styles.item}>

<Text style={styles.number}>
{index+1}
</Text>

<View style={{flex:1}}>

<Text style={styles.questionText}>
{q.Text}
</Text>

<View style={styles.tags}>

{q.Difficulty && (
<View style={[styles.tag,{backgroundColor:diff.bg}]}>
<Text style={{color:diff.color}}>
{q.Difficulty}
</Text>
</View>
)}

{q.CLO && (
<View style={styles.cloTag}>
<Text style={{color:"#0d47a1"}}>
{q.CLO}
</Text>
</View>
)}

{q.Marks && (
<View style={styles.marksTag}>
<Text style={{color:"#6a1b9a"}}>
{q.Marks} marks
</Text>
</View>
)}

</View>

</View>

<View style={styles.controls}>

<TouchableOpacity
disabled={index===0}
onPress={()=>moveUp(index)}
style={[styles.arrowBtn,index===0 && styles.disabled]}
>
<Text>↑</Text>
</TouchableOpacity>

<TouchableOpacity
disabled={index===localQuestions.length-1}
onPress={()=>moveDown(index)}
style={[styles.arrowBtn,index===localQuestions.length-1 && styles.disabled]}
>
<Text>↓</Text>
</TouchableOpacity>

</View>

</View>

);

})}

</ScrollView>

{/* Footer */}

<View style={styles.footer}>

<TouchableOpacity
onPress={onClose}
style={styles.cancelBtn}
>
<Text>Cancel</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>onSave(localQuestions)}
style={styles.saveBtn}
>
<Text style={{color:"#fff"}}>Save Order</Text>
</TouchableOpacity>

</View>

</View>

</View>

</Modal>

);

};

export default ReorderQuestionsModal;

const styles = StyleSheet.create({

overlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.5)",
justifyContent:"center",
alignItems:"center"
},

modal:{
width:"92%",
maxHeight:"90%",
backgroundColor:"#fff",
borderRadius:12
},

header:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
padding:15,
borderBottomWidth:1,
borderColor:"#eee"
},

headerLeft:{
flexDirection:"row",
alignItems:"center",
gap:10
},

title:{
fontSize:18,
fontWeight:"bold"
},

badge:{
backgroundColor:"#f5f5f5",
paddingHorizontal:8,
paddingVertical:4,
borderRadius:20,
fontSize:12
},

headerRight:{
flexDirection:"row",
gap:6
},

smallBtn:{
padding:6,
borderWidth:1,
borderColor:"#ddd",
borderRadius:6
},

closeBtn:{
backgroundColor:"#d32f2f",
paddingHorizontal:10,
paddingVertical:6,
borderRadius:6
},

content:{
padding:15
},

item:{
flexDirection:"row",
gap:10,
backgroundColor:"#fafafa",
padding:12,
borderRadius:8,
marginBottom:8
},

number:{
width:24,
textAlign:"center",
fontWeight:"bold"
},

questionText:{
fontSize:14,
marginBottom:6
},

tags:{
flexDirection:"row",
gap:6,
flexWrap:"wrap"
},

tag:{
paddingHorizontal:8,
paddingVertical:3,
borderRadius:20
},

cloTag:{
backgroundColor:"#e3f2fd",
paddingHorizontal:8,
paddingVertical:3,
borderRadius:20
},

marksTag:{
backgroundColor:"#f3e5f5",
paddingHorizontal:8,
paddingVertical:3,
borderRadius:20
},

controls:{
justifyContent:"center",
gap:4
},

arrowBtn:{
borderWidth:1,
borderColor:"#ddd",
padding:6,
borderRadius:6
},

footer:{
flexDirection:"row",
justifyContent:"flex-end",
gap:10,
padding:15,
borderTopWidth:1,
borderColor:"#eee"
},

cancelBtn:{
borderWidth:1,
borderColor:"#ddd",
paddingHorizontal:14,
paddingVertical:6,
borderRadius:6
},

saveBtn:{
backgroundColor:"#15803d",
paddingHorizontal:14,
paddingVertical:6,
borderRadius:6
},

disabled:{
opacity:0.4
}

});