import {useState} from "react";
import {
  RecoilRoot,
  atom,
  useRecoilState,
  useRecoilValue
} from "recoil";

function App() {
  return (
    <RecoilRoot>
      <ItemCreator/>
      <TodoList />
    </RecoilRoot>
  );
}

const todoListState = atom({
  key: 'todoListState',
  default: []
})

let id = 0
const ItemCreator = () => {
  const [text, setText] = useState('');
  const [newTodo, setNewTodo] = useRecoilState(todoListState)

  const handleClick = () => {
    setNewTodo([
      ...newTodo,
      {
        id: id++,
        text,
        isCompleted: false
      }
    ])
    setText('')
  }

  const handleChange = e => {
    const {target: {value}} = e
    setText(value)
  }

  return (
    <div>
      <input type="text" onChange={handleChange} value={text}/>
      <button onClick={handleClick}>Add</button>
    </div>
  )
}

/*const todos = [
  {id: 1, text: "Todo 1", isCompleted: false},
  {id: 2, text: "Todo 2", isCompleted: false},
  {id: 3, text: "Todo 3", isCompleted: true},
]*/

const TodoList = () => {
  const todos = useRecoilValue(todoListState)
  return (
    <>
      {todos.map(todo => {
        return <TodoItem key={todo.id} {...todo}/>
      })}
    </>
  )
}

const TodoItem = ({id, text, isCompleted}) => {
  const handleChange = () => {

  }

  return (
    <div>
      <input type="text" value={text} onChange={handleChange}/>
      <input type="checkbox" checked={isCompleted} />
      <button>x</button>
    </div>
  )
}

export default App;
