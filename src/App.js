import React, {useState} from "react";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState
} from "recoil";
import axios from "axios";

function App() {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<h1>Loading...</h1>}>
        <UserData />
        <TodoFilter />
        <TodoStats />
        <ItemCreator />
        <TodoList />
      </React.Suspense>
    </RecoilRoot>
  );
}

const todoListState = atom({
  key: 'todoListState',
  default: []
})

const todoFilterState = atom({
  key: 'todoFilterState',
  default: 'all'
})

const todoFilterSelector = selector({
  key: 'todoFilterSelector',
  get: ({get}) => {
    const list = get(todoListState)
    const filter = get(todoFilterState)

    switch (filter) {
      case "completed":
        return list.filter(item => item.isCompleted)
      case "notCompleted":
        return list.filter(item => !item.isCompleted)
      default:
        return list
    }
  }
})

const todoStatsSelector = selector({
  key: 'todoStatsSelector',
  get: ({get}) => {
    const list = get(todoListState)
    const toDo = list.filter(item => !item.isCompleted).length
    const completed = list.filter(item => item.isCompleted).length
    const completedPercentage = list.length === 0 ? 0 : completed / list.length

    return {
      total: list.length,
      toDo,
      completed,
      completedPercentage
    }
  }
})

const userDataSelector = selector({
  key: 'userDataSelector',
  get: async () => {
    const response = await axios.get('http://localhost:3003/users/1')
    return response.data
  }
})

let index = 0
const ItemCreator = () => {
  const [text, setText] = useState('');
  const setNewTodo = useSetRecoilState(todoListState)

  const handleClick = () => {
    setNewTodo(oldTodoList => {
      return [
        ...oldTodoList,
        {
          id: index++,
          text,
          isCompleted: false
        }
      ]
    })
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

const TodoList = () => {
  const todos = useRecoilValue(todoFilterSelector)
  return (
    <>
      {todos.map(todo => {
        return <TodoItem key={todo.id} {...todo}/>
      })}
    </>
  )
}

const changeItem = (id, todoList, changedItem) => {
  const index = todoList.findIndex(item => item.id === id)

  return [...todoList.slice(0, index), changedItem, ...todoList.slice(index + 1, todoList.length)]
}

const TodoItem = ({id, text, isCompleted}) => {
  const [todoList, setTodoList] = useRecoilState(todoListState)

  const handleChange = ({target: {value}}) => {
    const changedItem = {
      id,
      text: value,
      isCompleted
    }
    setTodoList(changeItem(id, todoList, changedItem))
  }

  const onToggleCompleted = () => {
    const changedItem = {
      id,
      isCompleted: !isCompleted,
      text
    }
    setTodoList(changeItem(id, todoList, changedItem))
  }

  const onHandleDeleteItem = () => {
    setTodoList(todoList.filter(todo => todo.id !== id))
  }

  return (
    <div>
      <input
        type="text"
        defaultValue={text}
        onChange={handleChange}
      />
      <input
        type="checkbox"
        defaultChecked={isCompleted}
        onChange={onToggleCompleted}
      />
      <button onClick={onHandleDeleteItem}>x</button>
    </div>
  )
}

const TodoFilter = () => {
  const [filterState, setFilterState] = useRecoilState(todoFilterState)

  const onSelectedOption = ({target: {value}}) => {
    setFilterState(value)
  }
  return (
    <div>
      Filter
      <select
        value={filterState}
        name="filter"
        id="filter"
        onChange={onSelectedOption}
      >
        <option value="all">Todos</option>
        <option value="completed">Completed</option>
        <option value="notCompleted">Not completed</option>
      </select>
    </div>
  )
}

const TodoStats = () => {
  const {total, toDo, completed, completedPercentage} = useRecoilValue(todoStatsSelector)
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <span>Total task: {total}</span>
      <span>Tasks to do: {toDo}</span>
      <span>Completed tasks: {completed}</span>
      <span>Progress: %{completedPercentage * 100}</span>
    </div>
  )
}

const UserData = () => {
  const {name} = useRecoilValue(userDataSelector)
  return(<h1>{name}</h1>)
}

export default App;
