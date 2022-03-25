import React, { useState, useEffect } from 'react'
import { Button, TextField } from '@mui/material'

import './App.css'
import lottery from './lottery'
import web3 from './web3'

function App() {
  const [manager, setManager] = useState<string>('')
  const [players, setPlayers] = useState<unknown[]>([])
  const [balance, setBalance] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    async function initLottery() {
      const lotteryManager: string = await lottery.methods.manager().call()
      const lotteryPlayers: unknown[] = await lottery.methods.getPlayers().call()
      const lotteryBalance: string = await web3.eth.getBalance(lottery.options.address)

      setManager(lotteryManager)
      setPlayers(lotteryPlayers)
      setBalance(lotteryBalance)
    }

    initLottery()
  }, [])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const accounts = await web3.eth.getAccounts()

    setMessage('Waiting on transaction success...')

    await lottery.methods.enter().send({
      from: accounts[0], // asumes first acc is used
      value: web3.utils.toWei(value, 'ether'),
    })

    setMessage('Congrats! You have been entered into this lottery!')
  }

  // no check for manager here, but irl we would check for that
  const handlePickWinner = async () => {
    const accounts = await web3.eth.getAccounts()

    setMessage('Waiting on transaction success...')

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    })

    // TODO: add winner variable to lottery contract, redeploy and display on screen
    setMessage('A winner has been picked!')
  }

  return (
    <div className='container'>
      <div>
        <h1>Lottery Contract</h1>
        <p>
          This contract is managed by <span>{manager}</span>
        </p>
        <p>
          There are currently <span>{players.length}</span> people entered into this lottery, competing to win{' '}
          <span>{web3.utils.fromWei(balance, 'ether')}</span> ether!
        </p>
      </div>
      <hr />
      <div className='app__form'>
        <form onSubmit={handleFormSubmit}>
          <h2>Want to try your luck?</h2>
          <p>Enter your stake of Ether: </p>
          <TextField
            id='outlined-basic'
            label='Ether stake'
            variant='outlined'
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <Button type='submit' variant='contained'>
            ENTER
          </Button>
        </form>
        <hr />
      </div>
      <div>
        <p>Time to pick a winner?</p>
        <Button onClick={handlePickWinner} variant='contained'>
          Pick Winner
        </Button>
      </div>
      <hr />
      <h3>{message}</h3>
    </div>
  )
}

export default App
