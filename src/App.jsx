import React, { useState, useEffect } from 'react'
import utils from './utils'
import Rodal from 'rodal'
import { faShoppingCart, faSearch, faStar, faTimes, faMinusCircle, faPlusCircle, faCreditCard, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import logo from './img/logo.png'
import Loader from 'react-loader-spinner'
import './App.css'
import 'rodal/lib/rodal.css'

export default function App() {

  const [modalDetail, setModalDetail] = useState(false)
  const [modalCart, setModalCart] = useState(false)
  const [modalCheckout, setModalCheckout] = useState(false)
  const [modalFinal, setModalFinal] = useState(false)
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
  const creditCard = 1020304050607080
  const [checkCreditCard, setCheckCreditCard] = useState(0)
  const [isValidCard, setIsValidCard] = useState(false)


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
    setLoader(false)

  }
  const removeItem = (id) => {

    setDataCart(dataCart.filter(item => item.id !== id))
    setAuxCart(auxCart.filter(item => item !== id))

  }
  const finalizePurchase = async () => {

    setLoaderBuy(true)
    let check = await checkStock(dataCart[0].id)

    if (check) {

      const multationQuery = `
      mutation{
        createSales(input: ${utils.queryfy(dataCart)}){
          title
          price
          reference
          amount
          available
          photo
        }
      }
    `
      consumerAPI(GRAPHQL_ENDPOINT, multationQuery).then((res) => {

        console.log(res)
        setLoaderBuy(false)
        setLoader(false)
        setDataCart([])
        setModalFinal(true)

      }).catch((error) => {
        console.log('error multationQuery API =>', error)
        setLoaderBuy(false)
        setLoader(false)
      })

      setModalCheckout(false)
      console.log('finalizePurchase', dataCart)


    }else{
      console.log('no stock...')
    }


  }

  const checkStock = async (idProduct) => {

    console.log('checkStock...', idProduct)

    // const consultProduct = `  
    //   query {
    //     getProduct(id: ${idProduct}){
    //       id
    //       title
    //       amount
    //       price
    //       available
    //     }
    //   }
    // `
    // consumerAPI(GRAPHQL_ENDPOINT, consultProduct).then((res) => {
    //   console.log(res.data.getProduct.available)
    // }).catch((error) => {
    //   console.log('toggleAmount =>', error)
    // })

    return true
  }

  useEffect(() => {

    let total = dataCart.reduce((prev, current) => {
      return prev + current.price * current.amount
    }, 0)

    setTotalBuy(total)

  }, [dataCart])

  useEffect(() => {

    setIsError(false)

    let consultQuery = `  
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

      if (res.data.getProducts.length > 0) { setData(res.data.getProducts) }
      setLoader(false)
    }).catch((error) => {
      console.log('error consumer API =>', error)
      setIsError(true)
      setLoader(false)
    })

  }, [])

  useEffect(() => {

    if (checkCreditCard === creditCard) {
      console.log('checkCreditCard:', checkCreditCard, isValidCard)
      setIsValidCard(true)
    } else {
      setIsValidCard(false)

      console.log('checkCreditCard:', checkCreditCard, isValidCard)
    }

  }, [checkCreditCard, isValidCard])

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
          <div onClick={() => { setShowPopover(false); dataCart.length > 0 ? setModalCart(true) : setModalCart(false) }} className="buy white">CONTINUAR</div>
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
            Carregando conte??do...
          </div>
          :
          isError
            ?
            <div className="loader">
              <div className="error">Erro...</div>
              <div>Verifique sua API de comunica????o...</div>
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
                  <th>Dispon??vel</th>
                  <th>Descri????o</th>
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
                        {
                          row.amount >= row.available
                            ?
                            <FontAwesomeIcon size="lg" icon={faPlusCircle} color="#ccc" />
                            :
                            <FontAwesomeIcon onClick={() => toggleAmount(row.id, true)} size="lg" icon={faPlusCircle} color="#ccc" />
                        }
                      </td>
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
            <div className="items-checkout" ><FontAwesomeIcon icon={faCreditCard} color="#666" />&nbsp; Cart??o de Cr??dito</div>
            <div className="items-checkout small" >N?? de Cart??o v??lido para compra: [{creditCard}]</div>
            <div className="items-checkout input" ><input onChange={(e) => setCheckCreditCard(parseInt(e.target.value))} type="number" placeholder="N??mero do cart??o" /></div>
            <div className="items-checkout input" ><input type="text" placeholder="Nome impresso no cart??o" /></div>
            <div className="items-checkout input" >
              <input type="text" placeholder="Validade do cart??o" />
            </div>
            <div className="items-checkout input" >
              <input type="number" placeholder="CVV" maxLength="3" />
            </div>
            <div className="items-checkout small" >
              {
                isValidCard && checkCreditCard > 0
                  ?
                  'Cart??o v??lido'
                  :
                  checkCreditCard > 0
                    ?
                    'Cart??o inv??lido'
                    :
                    ''
              }
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

              onClick={() => loaderBuy ? console.log('process...') : isValidCard ? finalizePurchase() : console.log('Invalid credit card....')}
              className="buy white">
              {
                loaderBuy
                  ?
                  'PROCESSANDO...'
                  :
                  isValidCard
                    ?
                    'FINALIZAR PEDIDO'
                    :
                    'PREENCHA O CART??O DE CR??DITO'
              }

            </div>
            <hr />
            <div onClick={() => { setShowPopover(false); setModalCheckout(false); setModalCart(true) }} className="buy-edit">EDITAR PEDIDOS</div>

          </div>
        </div>
      </Rodal>

      {/* modal final */}
      <Rodal visible={modalFinal} onClose={() => { setModalFinal(false) }}>
        <div className="modal-body">
          <div className="modal-final">
            <div><FontAwesomeIcon icon={faCheckCircle} color="rgb(10, 172, 51)" size="3x" /></div>
            <div>&nbsp;</div>
            <div>Venda conclu??da com sucesso!</div>
          </div>
        </div>
      </Rodal>
      <footer><img alt="logo" src={logo} style={{ width: '70px' }} />Shopping Cart - @Rosival_Souza</footer>
    </div>
  )
}
