import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import inquirer from 'inquirer'
import figlet from 'figlet'
import chalk from 'chalk'
import { join } from 'path'
import dayjs from 'dayjs'

// Set up database//////
const file = join('./db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter,{tasks:[]})
await db.read()



// Show welcome banner/////
console.log(
  chalk.white(figlet.textSync('Tasky', { horizontalLayout: 'default' })),
  chalk.blueBright(figlet.textSync('A.Hatem',{horizontalLayout:'default'}))
)

// Function to add a task/////
async function addTask() {
  const answers = await inquirer.prompt([
    { name: 'title', message: chalk.blueBright('Enter task title:') },
    { name: 'description', message: chalk.blueBright('Enter task description:') },
    { name: 'dueDate', message: chalk.blueBright('Enter due date (YYYY-MM-DD):') },
    {
      name: 'priority',
      message: chalk.blueBright('Choose priority:'),
      type: 'list',
      choices: ['1', '2', '3'],
    },
  ])

  db.data.tasks.push({
    ...answers,
    createdAt: dayjs().format('YYYY-MM-DD'),
    completed: false,
  })

  await db.write()
  console.log(chalk.green('Task added successfully'))
}

// Function to list tasks//////
async function listTasks() {
  const tasks = db.data.tasks
  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks found'))
    return
  }
  else
  tasks.forEach((task, index) => {
    console.log(
      `${index + 1}
       Title: ${chalk.bold(task.title)}
       Description:${task.description} 
       Due: ${task.dueDate}
       Priority: ${task.priority} 
       ${task.completed ? chalk.green('Completed') : chalk.red('Not Completed')}`
    )
  })
}



// Function to update a task//////
async function updateTask() {
  const tasks = db.data.tasks
  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks to update'))
    return
  }

  const { index } = await inquirer.prompt({
    type: 'list',
    name: 'index',
    message: 'Select a task to update:',
    choices: tasks.map((task, i) => ({
      name: `${task.title} - ${task.description}`,
      value: i
    }))
  })

  const oldTask = tasks[index]

  const answers = await inquirer.prompt([
    { name: 'title', message: 'New title:', default: oldTask.title },
    { name: 'description', message: 'New description:', default: oldTask.description },
    { name: 'dueDate', message: 'New due date (YYYY-MM-DD):', default: oldTask.dueDate },
    {
      name: 'priority',
      message: 'New priority:',
      type: 'list',
      choices: ['1', '2', '3'],
      default: oldTask.priority
    }
  ])

  tasks[index] = {
    ...oldTask,
    ...answers
  }

  await db.write()
  console.log(chalk.green('Task updated successfully'))
}

// Function to remove a task/////
async function removeTask() {
  const tasks = db.data.tasks
  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks to remove'))
    return
  }

  const { index } = await inquirer.prompt({
    type: 'list',
    name: 'index',
    message: 'Select a task to remove:',
    choices: tasks.map((task, i) => ({
      name: `${task.title} - ${task.description}`,
      value: i
    }))
  })

  tasks.splice(index, 1)
  await db.write()
  console.log(chalk.green('Task removed successfully'))
}

// Function to mark a task as completed/////
async function markTaskCompleted() {
  const tasks = db.data.tasks.filter(task => !task.completed)

  if (tasks.length === 0) {
    console.log(chalk.yellow('All tasks already completed!'))
    return
  }

  const { index } = await inquirer.prompt({
    type: 'list',
    name: 'index',
    message: 'Select a task to mark as completed:',
    choices: tasks.map((task, i) => ({
      name: `${task.title} - ${task.description}`,
      value: db.data.tasks.indexOf(task)
    }))
  })

  db.data.tasks[index].completed = true
  await db.write()
  console.log(chalk.green('Task marked as completed!'))
}

// Function to clear completed tasks/////
async function clearCompletedTasks() {
  const before = db.data.tasks.length
  db.data.tasks = db.data.tasks.filter(task => !task.completed)

  const after = db.data.tasks.length
  const removed = before - after

  if (removed === 0) {
    console.log(chalk.yellow('No completed tasks to clear'))
  } else {
    await db.write()
    console.log(chalk.green(`Cleared ${removed} completed task(s)`))
  }
}

// Menu to choose actions/////
async function mainMenu() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: ['Add Task','List Tasks','Update Task','Remove Task','Mark Task as Completed','Clear Completed Tasks','Exit'],

    })

    if (action === 'Add Task') {
      await addTask()
    } else if (action === 'List Tasks') {
      await listTasks()
        } else if (action === 'Update Task') {
      await updateTask()
    } else if (action === 'Remove Task') {
      await removeTask()
    } else if (action === 'Mark Task as Completed') {
      await markTaskCompleted()
    } else if (action === 'Clear Completed Tasks') {
      await clearCompletedTasks()
    } else {
      console.log(chalk.blue('Goodbye!'))
      process.exit()
    }
  }
}


mainMenu()
