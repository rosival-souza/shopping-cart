import React, { useState, useEffect } from 'react'
import utils from './utils'
import Rodal from 'rodal'
import { faShoppingCart, faSearch, faStar, faTimes, faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import logo from './img/logo.jpg'
import imgBook from './img/proc01.jpg'
import './App.css'
import 'rodal/lib/rodal.css'

export default function App() {

  const [modalDetail, setModalDetail] = useState(false)
  const [modalCart, setModalCart] = useState(false)
  const [dataCart, setDataCart] = useState([])
  const [showPopover, setShowPopover] = useState(false)
  const [data] = useState([
    {
      _id: 1,
      title: '1 - Livro Direito Processual',
      amount: 1,
      price: 139.50
    },
    {
      _id: 2,
      title: '2 - Livro Direito Processual',
      amount: 1,
      price: 123.30
    },
    {
      _id: 3,
      title: '3 - Livro Direito Processual',
      amount: 1,
      price: 85.43
    },
    {
      _id: 4,
      title: '4 - Livro Direito Processual',
      amount: 1,
      price: 100
    },
    {
      _id: 5,
      title: '5 - Livro Direito Processual',
      amount: 1,
      price: 209.87
    },
    {
      _id: 6,
      title: '6 - Livro Direito Processual',
      amount: 1,
      price: 859.87
    },
  ])
  const [dataDetail, setDataDetal] = useState([])
  const [totalBuy, setTotalBuy] = useState(0)
  const [auxCart, setAuxCart] = useState([])
  const [loader, setLoader] = useState(false)

  const consumerAPI = async (graphqlEndpoint, query, variables = {}) => {
    setLoader(true)
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    })

    return response.json()
  }
  const addCart = () => {

    if (!auxCart.includes(dataDetail._id)) {
      setAuxCart([...auxCart, dataDetail._id])
      setDataCart(dataCart => [...dataCart, dataDetail])
    }
    setModalDetail(false)
    setShowPopover(true)

  }
  const toggleAmount = (_id, isIncrement) => {

    setDataCart((prevDataCart) =>
      prevDataCart.map((item) => {
        return item._id === _id ? { ...item, amount: isIncrement ? item.amount + 1 : item.amount === 1 ? item.amount : item.amount - 1 } : item
      })
    )

  }
  const removeItem = (_id) => {

    setDataCart(dataCart.filter(item => item._id !== _id))
    setAuxCart(auxCart.filter(item => item !== _id))

  }
  useEffect(() => {

    let total = dataCart.reduce((prev, current) => {
      return prev + current.price
    }, 0)

    setTotalBuy(total)
    // console.log(`dataCart => `,dataCart)

  }, [dataCart, dataDetail])

  useEffect(() => {

    const GRAPHQL_ENDPOINT = 'http://127.0.0.1:4000/api'
    const consultQuery = `  
      query {
        getProducts{
          photo
          title
          price
          reference
          amount
        }
      }
    `

    consumerAPI(GRAPHQL_ENDPOINT, consultQuery).then((res) => {
      console.log(res)
      setLoader(false)
    }).catch((error)=>{
      console.log('error consumer API =>', error)
      setLoader(false)
    })


  }, [])

  return (
    <div className="app">

      <header>
        <div className="logo">
          <img alt="product" src={logo} style={{ width: '70px' }} /> Shopping Cart
        </div>
        <div className="cart" onClick={() => setShowPopover(!showPopover)}>
          <FontAwesomeIcon icon={faShoppingCart} color="#666" />
          <div className="badge">{dataCart.length}</div>
        </div>
        <div className="popover" style={{ display: showPopover ? 'inline' : 'none' }} >
          {
            dataCart.map((row, idx) =>
              <div key={idx}>
                <div className="detal-popover">
                  <div><img alt="product" src={imgBook} style={{ width: '40px' }} /></div>
                  <div>{row.title}</div>
                  <div>{utils.formatMoneyBRL(row.price)}</div>
                </div>
              </div>
            )
          }
          <div className="title">Subtotal: R$ {utils.formatMoneyBRL(totalBuy)}</div>
          <br />
          <div onClick={() => { setShowPopover(false); setModalCart(true) }} className="buy white">FINALIZAR COMPRA</div>
        </div>
      </header>
      {
        loader
          ?
          <div className="loader">Loader...</div>
          :
          <div className="container">
            {
              data.map((row, idx) =>
                <div key={idx} className="products" onClick={() => { setDataDetal(row); setModalDetail(true) }}>
                  <div className="photo"><img alt="product" src={imgBook} style={{ width: '150px' }} /></div>
                  <div className="description">
                    {row.title}
                  </div>
                  <div className="description bold">
                    <FontAwesomeIcon icon={faStar} color="#ffd11a" />
                    <FontAwesomeIcon icon={faStar} color="#ffd11a" />
                    <FontAwesomeIcon icon={faStar} color="#ffd11a" />
                    <FontAwesomeIcon icon={faStar} color="#ffd11a" />
                    <FontAwesomeIcon icon={faStar} color="#ffd11a" />
                  </div>
                  <div className="description bold">
                    R$ {utils.formatMoneyBRL(row.price)}
                  </div>
                  <div onClick={() => { setDataDetal(row); setModalDetail(true) }} className="buy white">DETALHES &nbsp;<FontAwesomeIcon icon={faSearch} rotation={90} /></div>
                </div>
              )
            }
          </div>

      }

      {/* detail products */}
      <Rodal visible={modalDetail} onClose={() => { setModalDetail(false) }}>
        <div className="modal-body">
          <div className="left"><img alt="product" src={imgBook} style={{ width: '200px' }} /></div>
          <div className="right">
            <div className="detal-modal medium">
              {dataDetail.title}
            </div>
            <div className="detal-modal small">
              Ref.: AD6-0222-014-02
            </div>
            <div className="detal-modal bold">
              {utils.formatMoneyBRL(dataDetail.price)}
            </div>
            <div className="detal-modal bold">
              <div onClick={() => addCart()} className="buy white">ADICIONAR A SACOLA &nbsp;<FontAwesomeIcon icon={faShoppingCart} /></div>
            </div>
          </div>
        </div>
      </Rodal>

      {/* detail cart */}
      <Rodal visible={modalCart} onClose={() => { setModalCart(false) }}>
        <div className="modal-body">
          <div className="myCart">
            <span className="title">Meu Carrinho</span>
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>Qtd</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Remover</th>
                </tr>
                {
                  dataCart.map((row, idx) =>
                    <tr key={idx} >
                      <td><img alt="product" src={imgBook} style={{ width: '40px' }} /></td>
                      <td>
                        <FontAwesomeIcon onClick={() => toggleAmount(row._id, false)} icon={faMinusCircle} color="#ccc" size="lg" />&nbsp;&nbsp;{row.amount}
                        &nbsp;&nbsp;<FontAwesomeIcon onClick={() => toggleAmount(row._id, true)} size="lg" icon={faPlusCircle} color="#ccc" /></td>
                      <td>{row.title}</td>
                      <td>R$ {utils.formatMoneyBRL(row.price * row.amount)}</td>
                      <td onClick={() => removeItem(row._id)}><FontAwesomeIcon icon={faTimes} color="red" size="lg" /></td>
                    </tr>
                  )
                }
              </tbody>
            </table>


          </div>
          <div className="resumeCart">
            <span className="title">Resumo da compra</span>
          </div>
        </div>
      </Rodal>
      <footer><img alt="logo" src={logo} style={{ width: '70px' }} /> Shopping Cart - @Rosival de Souza</footer>
    </div>
  )
}
