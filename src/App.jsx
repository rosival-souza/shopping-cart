import React, { useState, useEffect } from 'react'
import utils from './utils'
import Rodal from 'rodal'
import { faShoppingCart, faSearch, faStar, faTimes, faMinusCircle, faPlusCircle, faCreditCard } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import logo from './img/logo.png'
import Loader from 'react-loader-spinner'
import './App.css'
import 'rodal/lib/rodal.css'

export default function App() {

  const [modalDetail, setModalDetail] = useState(false)
  const [modalCart, setModalCart] = useState(false)
  const [modalCheckout, setModalCheckout] = useState(false)
  const [dataCart, setDataCart] = useState([])
  const [showPopover, setShowPopover] = useState(false)
  const [data, setData] = useState([])
  const [dataDetail, setDataDetal] = useState([])
  const [totalBuy, setTotalBuy] = useState(0)
  const [auxCart, setAuxCart] = useState([])
  const [loader, setLoader] = useState(false)
  const [loaderBuy, setLoaderBuy] = useState(false)
  const [isError, setIsError] = useState(false)
  const GRAPHQL_ENDPOINT = 'http://127.0.0.1:4000/api'

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

    if (!auxCart.includes(dataDetail.id)) {
      setAuxCart([...auxCart, dataDetail.id])
      setDataCart(dataCart => [...dataCart, dataDetail])
    }
    setModalDetail(false)
    setShowPopover(true)

  }
  const toggleAmount = (id, isIncrement) => {

    setDataCart((prevDataCart) =>
      prevDataCart.map((item) => {
        return item.id === id ? { ...item, amount: isIncrement ? item.amount + 1 : item.amount === 1 ? item.amount : item.amount - 1 } : item
      })
    )

  }
  const removeItem = (id) => {

    setDataCart(dataCart.filter(item => item.id !== id))
    setAuxCart(auxCart.filter(item => item !== id))

  }
  const finalizePurchase = () => {
  
    setLoaderBuy(true)
    
    const multationQuery = `
        mutation{
          createSales(input:{
          title: "product Two"
          price: 193.45
          reference: "reference Two"
          amount: 1
          available: 21
          id_product: 2
        }){
          id
          title
          }
        }
    `
    consumerAPI(GRAPHQL_ENDPOINT, multationQuery).then((res) => {

      console.log(res)
      setLoaderBuy(false)
      setLoader(false)

    }).catch((error) => {
      console.log('error multationQuery API =>', error)
      setLoaderBuy(false)
      setLoader(false)
    })
    
    setModalCheckout(false)
    console.log('finalizePurchase', dataCart)

  }

  useEffect(() => {

    let total = dataCart.reduce((prev, current) => {
      return prev + current.price * current.amount
    }, 0)

    setTotalBuy(total)

  }, [dataCart, dataDetail])

  useEffect(() => {
    setIsError(false)
    const consultQuery = `  
      query {
        getProducts{
          id
          photo
          title
          price
          reference
          amount
          available
        }
      }
    `
    consumerAPI(GRAPHQL_ENDPOINT, consultQuery).then((res) => {
      console.log(res)
      setData(res.data.getProducts)
      setLoader(false)
    }).catch((error) => {
      console.log('error consumer API =>', error)
      setIsError(true)
      setLoader(false)
    })

  }, [])

  useEffect(()=>{
    console.log('change loader', loader)
  },[loader])

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
          <div className="close" onClick={() => setShowPopover(false)}>< FontAwesomeIcon icon={faTimes} size="sm" /></div>
          {

            <table className="detail">
              <tbody>
                {
                  dataCart.map((row, idx) =>
                    <tr key={idx} >
                      <td><img alt="product" src={`data:image/jpeg;base64,${row.photo}`} style={{ width: '40px' }} /></td>
                      <td>( {row.amount} )</td>
                      <td>{row.title}</td>
                      <td className="bold">R$ {utils.formatMoneyBRL(row.price * row.amount)}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          }
          <hr />
          <div className="title">Subtotal: R$ {utils.formatMoneyBRL(totalBuy)}</div>
          <br />
          <div onClick={() => { setShowPopover(false); setModalCart(true) }} className="buy white">CONTINUAR</div>
        </div>
      </header>
      {
        loader
          ?
          <div className="loader">
            <Loader
              color="#1ab2ff"
              height={60}
              width={60}
              type="Watch"
              className="pulse-yellow"
            />
            Carregando conteúdo...
          </div>
          :
          isError
            ?
            <div className="loader">
              <div className="error">Erro...</div>
              <div>Verifique sua API de comunicação...</div>
            </div>
            :
            <div className="container">
              {
                data.map((row, idx) =>
                  <div key={idx} className="products" onClick={() => { setDataDetal(row); setModalDetail(true) }}>
                    <div className="photo"><img alt="product" src={`data:image/jpeg;base64,${row.photo}`} style={{ width: '150px' }} /></div>
                    <div className="description">
                      {row.title}
                    </div>
                    <div className="description">
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
          <div className="left"><img alt="product" src={`data:image/jpeg;base64,${dataDetail.photo}`} style={{ width: '200px' }} /></div>
          <div className="right">
            <div className="detal-modal medium">
              {dataDetail.title}
            </div>

            <hr />
            <div className="detal-modal small">
              <span className="bold">Ref: </span>&nbsp; {dataDetail.reference}
            </div>
            <div className="detal-modal small">
              <FontAwesomeIcon icon={faStar} color="#ffd11a" />
              <FontAwesomeIcon icon={faStar} color="#ffd11a" />
              <FontAwesomeIcon icon={faStar} color="#ffd11a" />
              <FontAwesomeIcon icon={faStar} color="#ffd11a" />
              <FontAwesomeIcon icon={faStar} color="#ffd11a" />
            </div>
            <div className="detal-modal bold">
              R$ {utils.formatMoneyBRL(dataDetail.price)}
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
            <hr />
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>Qtd</th>
                  <th>Disponível</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Remover</th>
                </tr>
                {
                  dataCart.length > 0 && dataCart.map((row, idx) =>
                    <tr key={idx} >
                      <td><img alt="product" src={`data:image/jpeg;base64,${row.photo}`} style={{ width: '40px' }} /></td>
                      <td>
                        <FontAwesomeIcon onClick={() => toggleAmount(row.id, false)} icon={faMinusCircle} color="#ccc" size="lg" />&nbsp;&nbsp;{row.amount}
                        &nbsp;&nbsp;
                        <FontAwesomeIcon onClick={() => toggleAmount(row.id, true)} size="lg" icon={faPlusCircle} color="#ccc" /></td>
                      <td>{row.available - row.amount}</td>
                      <td>{row.title}</td>
                      <td className="bold">R$ {utils.formatMoneyBRL(row.price * row.amount)}</td>
                      <td onClick={() => removeItem(row.id)}><FontAwesomeIcon icon={faTimes} color="red" size="lg" /></td>
                    </tr>
                  )
                }
              </tbody>
            </table>


          </div>
          <div className="resumeCart">
            <div className="items title">Resumo da compra</div>
            <hr />
            <div className="items" >SubTotal ({dataCart.length})</div>
            <hr />
            <div className="items title">Valor Total: R$ {utils.formatMoneyBRL(totalBuy)}</div>
            <hr />
            <div onClick={() => { setShowPopover(false); setModalCheckout(true); setModalCart(false) }} className="buy white">FINALIZAR COMPRA</div>
          </div>
        </div>
      </Rodal>

      {/* detail checkout */}
      <Rodal visible={modalCheckout} onClose={() => { setModalCheckout(false) }}>
        <div className="modal-body">
          <div className="checkout-left">
            <span className="title">Formas de Pagamento</span>
            <hr />
            <div className="items-checkout" ><FontAwesomeIcon icon={faCreditCard} color="#666" />&nbsp; Cartão de Crédito</div>
            <div className="items-checkout input" ><input type="number" placeholder="Número do cartão" /></div>
            <div className="items-checkout input" ><input type="text" placeholder="Nome impresso no cartão" /></div>
            <div className="items-checkout input" >
              <input type="text" placeholder="Validade do cartão" />
            </div>
            <div className="items-checkout input" >
              <input type="number" placeholder="CVV" maxLength="3" />
            </div>
          </div>
          <div className="checkout-right">
            <div className="items title">Resumo do Pedido</div>
            <hr />
            <div className="items" >SubTotal ({dataCart.length})</div>
            <hr />
            <div className="items title">Valor Total: R$ {utils.formatMoneyBRL(totalBuy)}</div>
            <hr />
            <div 

            onClick={() => loaderBuy ? console.log('process...') : finalizePurchase()} 
            className="buy white">
              {
                loaderBuy
                  ?
                  'PROCESSANDO...'
                  :
                  'FINALIZAR PEDIDO'
              }

            </div>
            <hr />
            <div onClick={() => { setShowPopover(false); setModalCheckout(false); setModalCart(true) }} className="buy-edit">EDITAR PEDIDOS</div>

          </div>
        </div>
      </Rodal>
      <footer><img alt="logo" src={logo} style={{ width: '70px' }} />Shopping Cart - @Rosival_Souza</footer>
    </div>
  )
}
