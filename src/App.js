import './App.css';
import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Popup from 'reactjs-popup';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faWhatsapp} from '@fortawesome/free-brands-svg-icons';
import {faEnvelope} from '@fortawesome/free-solid-svg-icons';
function App() {
  //consigue la fecha de hoy
  let hoyDia = new Date();
  hoyDia.setDate(hoyDia.getDate());
  var daten = hoyDia.toISOString().substring(0,10);
  
  var btn = document.getElementById("buttonCambio");

  const [urlCustom, setServUrlCustom] = useState('localhost'); //201.190.234.3 , hamburgo.sytes.net , 181.90.216.96
  const [puertoCustom, setServPuertoCustom] = useState('3001');
  
  //variables para cada input
  const [setNombre, setServNombre] = useState('');
  const [setDesc, setServDesc] = useState('');
  const [setDate, setServDate] = useState(daten);
  const [setDura, setServDura] = useState('');
  const [setPrecio, setServPrecio] = useState('');
  const [setMoneda, setServMoneda] = useState('');
  const [setVto, setServVto] = useState(daten);
  const [setCod, setServCod] = useState('');
  const [servLista, setServLista]=useState([]);
  const [servListaReg, setServListaReg]=useState([]);
  const [setBoolBaja, setServBoolBaja] = useState(false);
  const [setNoMolestar, setServNoMolestar] = useState(false);
  const [setWPBool, setServWPBool] = useState(true);
  const [setEmailBool, setServEmailBool] = useState(true);
  const [open, setOpen] = React.useState(false);

  let textoCustom = "";
  let asuntoCustom = "";
  let canDiasCheck = 30;
  let areaStaffs = "";

 
  //let TextoCustomFront = "";
//render onload y traigo el tiempo faltante para que expire un servicio
  useEffect(()=>{

    document.getElementById("cbEmail").checked = setEmailBool;
    document.getElementById("cbWP").checked = setWPBool;
    
    let hoyDia = new Date();
    Axios.get('http://'+ urlCustom +':'+ puertoCustom+'/api/getOnLoad').then((response) => {
      setServLista(response.data[0]);
      let nombresMail = "";
      let nombresMailWp = "";
      let datepago = new Date();
      let mailfroms = "pruebaenvio44@hotmail.com";
      let mailtos = "";
      let wptos = "";
      let mailsubjects ="Licencias pronto a vencer";
      
      /*aqui calculamos la variable millistillN, que calcula cuanto tiempo falta en el dia de hoy hasta las 9am, si ya pasaron las 9
      envia el mensaje en el momento, si todavia no son las 9, hace un timeout de la cantidad de tiempo que falte para las 9(osea el valor de millistillN)
      ,modifica los datos si se modificaron, y envia los mensajes*/
      var millisTillN = new Date(hoyDia.getFullYear(), hoyDia.getMonth(), hoyDia.getDate(), 11, 3, 0, 0) - hoyDia;
      if (millisTillN < 0) {
        console.log((millisTillN/60000)/60);
        console.log("ya pasaron las 9 bro, intentá de nuevo mañana, llegaste "+ (Math.floor(((millisTillN*(-1))/60000)/60)) +" Horas y "+ (((millisTillN*(-1))/60000) % 60).toFixed(0) + " minutos tarde" )
       } else{
          console.log("se deberia enviar un mensaje en "+ millisTillN + "nombres es " + nombresMail)
          setTimeout(() => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            areaStaffs = document.getElementById('areaSelectID').value;
            Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/getMails',  { params: {areaStaff : areaStaffs}}).then(response => {
              response.data.map((val) => {  
                mailtos= mailtos + val.staffMail +"; ";
                wptos = wptos + val.staffWP +"; ";
                return(console.log(mailtos+wptos));
              })
            })
            // eslint-disable-next-line react-hooks/exhaustive-deps
            canDiasCheck = document.getElementById("canDiasInput").value;
            response.data[0].map((val) =>{
              let dateexp = new Date(val.licenciaExpire.substring(0,10));
              var diasRestantes = (dateexp - datepago)/ (1000 * 60 * 60 * 24);
              var diasRestInt = Math.floor(diasRestantes);
              var estadoLicActual = val.estadoLicencia;
              if(diasRestantes <= canDiasCheck && estadoLicActual !== 6 && estadoLicActual !== 5){
                console.log("entro " + canDiasCheck)
                nombresMail = nombresMail + " <br /> <b> * " + val.licenciaNombre + ", en " + diasRestInt + " días";
                nombresMailWp = nombresMailWp + "\n* " + val.licenciaNombre + ", en " + diasRestInt + " días";
              } 
              return(console.log(Math.floor(diasRestantes) + "y" + canDiasCheck));
            });
            let mailhtmls =" <p style='color : green'> las liencias que estan por vencer en menos de "+ canDiasCheck +" días son: " + nombresMail + "</p>";
            let wpmsgs = "Las licencias que estan por vencer en menos de "+ canDiasCheck + " Días, son: " + nombresMailWp;

            if(textoCustom !== ""){
              mailhtmls = textoCustom;
              wpmsgs = textoCustom;
            }
            if(asuntoCustom !== ""){
              mailsubjects = asuntoCustom;
            }
            console.log(mailhtmls);
            if(nombresMail !== ""){
              console.log("entro a enviar mail");
              Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/sendMensaje', {params: {
                servWPBool : setWPBool,
                servEmailBool : setEmailBool,
                wpmsg : wpmsgs,
                wpto : wptos,
                mailfrom : mailfroms,
                mailto : mailtos,
                mailsubject : mailsubjects,
                mailhtml : mailhtmls}}).then(
                response =>{
                  nombresMail = "";
                });
            }else{
              console.log("no mando el mail idkwhy");
            }
          
          }, millisTillN);
       }
    })
  }, [canDiasCheck, textoCustom, areaStaffs, asuntoCustom]);

  const forzarEnvioMails = () => {
    Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/getOnLoad').then((response) => {
      areaStaffs = document.getElementById('areaSelectID').value;
      let nombresMail = "";
      let nombresMailWp = "";
      let datepago = new Date();
      response.data[0].map((val) =>{
        let dateexp = new Date(val.licenciaExpire.substring(0,10));
        var diasRestantes = (dateexp - datepago)/ (1000 * 60 * 60 * 24);
        var diasRestInt = Math.floor(diasRestantes);
        var estadoLicActual = val.licenciaEstado;
        console.log("estado lice es " + val.licenciaEstado);
        if(diasRestantes <= canDiasCheck && estadoLicActual !== 6 && estadoLicActual !== 5){
          console.log("estadLicAct " + estadoLicActual);
          nombresMail = nombresMail + " <br /> <b> * " + val.licenciaNombre + ", en " + diasRestInt + " días";
          nombresMailWp = nombresMailWp + "\n* " + val.licenciaNombre + ", en " + diasRestInt + " días";
        } 
        return(console.log()) 
      });
      
      let mailfroms = "pruebaenvio44@hotmail.com";
      let mailtos = "";
      let wptos = "";
      let mailsubjects ="Licencias pronto a vencer";
      let mailhtmls =" <p style='color : green'> Las liencias que están por vencer en menos de "+ canDiasCheck +" días son: " + nombresMail + "</p>";
      let wpmsgs = "Las licencias que están por vencer en menos de "+ canDiasCheck + " Días, son: " + nombresMailWp;
      if(textoCustom !== ""){
        mailhtmls = textoCustom;
        wpmsgs = textoCustom;
      }
      if(asuntoCustom !== ""){
        mailsubjects = asuntoCustom;
      }
      console.log(mailhtmls);
      
      Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/getMails', {params:{areaStaff : areaStaffs}}).then(response => {
        response.data.map((val) => {  
          mailtos= mailtos + val.staffMail +"; ";
          wptos= wptos+ val.staffWP + "; ";
          return(console.log(mailtos+ wptos));
        }) 
        Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/sendMensaje', {params: {
          servWPBool : setWPBool,
          servEmailBool : setEmailBool,
          wpmsg : wpmsgs,
          wpto : wptos,
          mailfrom : mailfroms,
          mailto : mailtos,
          mailsubject : mailsubjects,
          mailhtml : mailhtmls}});
        nombresMail = "";
      })
    })


  }

// funcion trigereada por el boton guardar cambios
  const guardarCambiosAver =()=>{
    if(document.getElementById("filtroDias").value === "TODO" && document.getElementById("filtroMoneda").value === "TODO"){
      Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/guardarCambios');
      cambioDeEstado(false, "Sin Cambios");
      console.log("guardo cambios")
    }else{
      console.log("no se guardo nada")
      window.alert("Quitar filtros para guardar")
    }
  }

// funcion trigereada por el boton cancelar cambios
  const cancelarCambiosAver =()=>{
    Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/cancelarCambios').then(response =>{
      console.log(response.data[0]);
      setServLista(response.data[0]);
      cambioDeEstado(false, "Cambios sin Guardar");
    });
    
  }

//esta funcion nos sirve para autocompletar el resto de campos input, en caso de que el nombre que se escriba tenga un registro ya hecho.
  function unNombre(nombre){
      
      Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/getNombre', {params:{nombreSe : nombre}}).then(response => {
          console.log(response.data);
          response.data.map((val) => {
            if(val){
              setServDesc(document.getElementById("cbBaja").hidden = false);
              setServDesc(document.getElementById("lblBaja").hidden = false);
              document.getElementById("cbNoMolestar").hidden = false;
              document.getElementById("lblNoMolestar").hidden = false;
              console.log("algo hay");
              document.getElementById("descInput").value = val.licenciaDesc;
              setServDesc(document.getElementById("descInput").value);
              document.getElementById("fechaInput").value = val.licenciaFechaAlta.substring(0,10);
              setServDate(document.getElementById("fechaInput").value);
              document.getElementById("duraInput").value = val.licenciaDurac;
              setServDura(document.getElementById("duraInput").value);
              document.getElementById("precioInput").value = val.licenciaPrecio;
              setServPrecio(document.getElementById("precioInput").value);
              document.getElementById("monedaInput").value = val.licenciaPrecioMoneda;
              setServMoneda(document.getElementById("monedaInput").value);
              document.getElementById("vtoInput").value = val.licenciaExpire.substring(0,10);
              setServVto(document.getElementById('vtoInput').value);
              document.getElementById('codInput').value = val.licenciaFacturaN;
              setServCod(document.getElementById('codInput').value);
              if(val.licenciaEstado === 5){
                document.getElementById("cbBaja").checked = true;
              }
              if(val.licenciaEstado === 6){
                document.getElementById("cbNoMolestar").checked = true;
              }
              document.getElementById("btnEliminar").style.display = 'initial';
              document.getElementById("btnHistorial").style.display = 'initial';
            }
            return(console.log(response));
          })
          // eslint-disable-next-line
          if (response.data.length == 0){//restablecemos los campos si no hay coincidencia en el nombre
            setServDesc(document.getElementById("cbBaja").hidden = true);
            setServDesc(document.getElementById("cbBaja").checked = false);
            setServDesc(document.getElementById("cbNoMolestar").hidden = true);
            setServDesc(document.getElementById("cbNoMolestar").checked = false);
            setServDesc(document.getElementById("lblBaja").hidden = true);
            setServDesc(document.getElementById("lblNoMolestar").hidden = true);
            setServDesc(document.getElementById("descInput").value = "");
            setServDate(document.getElementById("fechaInput").value = daten);
            setServDura(document.getElementById("duraInput").value = "");
            setServPrecio(document.getElementById("precioInput").value ="");
            setServMoneda(document.getElementById("monedaInput").value = "");
            setServVto(document.getElementById('vtoInput').value);
            setServCod(document.getElementById('codInput').value = "");
            document.getElementById("btnEliminar").style.display = 'none';
            document.getElementById("btnHistorial").style.display = 'none';
          }  
      })  
  }

//calculo de vencimiento dinamico, cuando se cambian la fecha de pago y la duracion, se actualiza el vto automaticamente
  function calculoVto(alta, duracion)
  {
    Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/calcularVto', {params:{ uPago : alta, uDuracion: duracion}}).then(response =>{
      document.getElementById("vtoInput").value = response.data.substring(0,10);
      setServVto(document.getElementById("vtoInput").value);
      console.log(response);
    })
  }
  

  //funcion para agrgar un servicio a la lista

   const agregarServicio =() => {
    cambioDeEstado(true, "Cambios sin Guardar");
    Axios.post('http://'+ urlCustom+':'+puertoCustom+'/api/insert', {
      servName: setNombre,
      servDesc: setDesc,
      servDurac: setDura,
      servAlta: setDate,
      servPrecio: setPrecio,
      servMoneda: setMoneda,
      servCod: setCod,
      servVto: setVto,
      servBaja: setBoolBaja,
      servNoMolestar: setNoMolestar

      }).then(function (response) {
        console.log( "respuesta del insert es: " + setBoolBaja);
        consultarNombres();
      })
      .catch(function (error) {
        console.log( "inert error es: " +error);
      });
      setTimeout(() => {
        //consultarNombres()
      }, 150);  
  }
  
  
  const eliminarServicio = () => {
    Axios.post('http://'+ urlCustom+':'+puertoCustom+'/api/deleServicio', {servName:setNombre}).then((response) => {
      setServLista(response.data);
      console.log("eliminarServicio");
      console.log(response.data);
      cambioDeEstado(true, "Cambios sin Guardar");
    })
  }

  const historialServicio = () => {
    Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/getHistorial', {params: {nombreService : document.getElementById("nombreLicencia").value}})
    .then((response) => {
      //hay que mostrar este select en un popup
      setServListaReg(response.data)
      console.log(response.data)
      setOpen(true)
    })
  }

  const consultarNombres = () => {
    Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/get').then((response) => {
      setServLista(response.data);
      console.log(response.data)
    })
  }

  //esta funcion se llama cada vez que hay un cambio en alguno de los select de los filtros
  const filtrarNombres =()=> {
    Axios.get('http://'+ urlCustom+':'+puertoCustom+'/api/getFiltrado', {params:{diasRestantes : document.getElementById("filtroDias")
    .value, money : document.getElementById("filtroMoneda").value  }}).then(response => {
      setServLista(response.data);
      console.log(response.data);
    })
  }
  
  //maneja la label y el boton de guardar cambios
  function cambioDeEstado(huboCambios, textDisplay){
    console.log(huboCambios);
    if(huboCambios === true){
      console.log("entro al true");
      btn.disabled = false;
      document.getElementById('labelCambio').textContent= "Cambios sin guardar";    
    }
    if(huboCambios === false){
      console.log("entro al false");
      btn.disabled = true;
      document.getElementById('labelCambio').textContent= "Sin Cambios";
    }  
  }

  const guardarMailsDatos = () => {
    areaStaffs = document.getElementById("areaSelectID").value;
    canDiasCheck = document.getElementById("canDiasInput").value;
    textoCustom = document.getElementById("otroTextInput").value;
    asuntoCustom = document.getElementById("otroAsunInput").value;
    window.alert(" Datos Guardados ");
    console.log(canDiasCheck);
  }

  const cancelarMailsDatos = () => {
    areaStaffs= "";
    document.getElementById("areaSelectID").value = "Sistemas";
    canDiasCheck = 30;
    document.getElementById("canDiasInput").value = 30;
    textoCustom = "";
    document.getElementById("otroTextInput").value = "";
    asuntoCustom = "";
    document.getElementById("otroAsunInput").value = "";
    window.alert("Datos por defecto");
  }

  //esta funcion cambia la clase del campo "estado" de la tabla, segun su valor, para que tenga el color apropiado
  function quecolorsoy(estadoLic){
    var inpacompara = 0;
    inpacompara = estadoLic;
    console.log(estadoLic + " " + inpacompara);
    let className = "";
    switch(inpacompara){
      case 0:
        className = "redclass";
        return(className)
      case 1:
        className = "greenclass";
        return(className)
      case 2:
        className = "yellowclass";
        return(className)
      case 3:
        className = "orangeclass";
        return(className)
      case 4:
        className = "blueclass";
        return(className)
      case 5:
        className = "greyclass";
        return(className)
      case 6:
        className = "violetaclass"
        return(className)
      default:
        className = "greenclass";
        return(className);
    }

  }
  const GuardarIPBack = () => {
    setServUrlCustom(document.getElementById("inputIPBack").value)
    setServPuertoCustom(document.getElementById("inputPuertoBack").value)
    consultarNombres();
    window.alert("cambiados los datos")
    
  }
  
  return (
    <div className="App">
      <div>
        <label>ip back</label>
        <input id='inputIPBack' defaultValue={urlCustom}/>
        <label>puerto back</label>
        <input id='inputPuertoBack' defaultValue={puertoCustom}/>
        <button onClick={GuardarIPBack}>Okay</button>
      
      </div>
      <Popup className='ppPopup' setOpen={setOpen} open={open}
        position="right center">
        <div >
        <table>
              <thead>
              <tr>
                <th>Nombre</th>
                <th>Último Pago</th>
                <th>Precio</th>
                <th>Moneda</th>
                <th>Codigo Factura</th>
              </tr>
            </thead>
            <tbody>
          {servListaReg.map((val) => {
            return (
              <tr>
                <td className='leftearTexto'>{val.nombreServicioPago}</td>
                <td >{val.fechaPagoUltima.substring(0,10)}</td>
                <td className='leftearTexto'>{val.precioPago}</td>
                <td>{val.monedaPago}</td>
                <td>{val.numeroFacturaPago}</td>
              </tr>
            )
          })}
          </tbody>
          </table>
        </div>
        <div className='divButtonPop'><button className='btnPopup' onClick={() => setOpen(false)}>Cerrar</button></div>
        
      </Popup>

      <text className='tituloApp'>Licencias Hamburgo Vencimientos</text>

      {/* diseño formulario de carga de suscripcion */}
      <div className= "formLicenciaNueva">
        <label className = "etiquita">Nombre</label>
        <input id="nombreLicencia" type='text' name='nombreLicencia' placeholder="Nombre" list="serviciosLista" 
          onChange={(e)=>{
            setServNombre(e.target.value);
            unNombre(e.target.value);
          }}/>
        
        {/* datalist de sugerencia con servicios ya registrados, traidos de la tabla */}
          <datalist id="serviciosLista">
            {servLista.map((val) => {
            return (
              <option value={val.licenciaNombre}></option>
            )
          })}
          </datalist>

        <label>Descripción</label>
        <input type = "text" id="descInput" name="descripcionLicencia" placeholder= "Descripción" onChange={(e)=>{
          setServDesc(e.target.value)}}/>

        <label>Fecha Último Pago</label>
        <input type="date" id="fechaInput" name ="altaLicencia" defaultValue={daten} placeholder='Último pago' onChange={(e)=>{
          setServDate(e.target.value);
          calculoVto(e.target.value, document.getElementById("duraInput").value);
          }} />
        

        <label>Duración en meses</label>
        <input type = "number" id="duraInput" name="duracionLicencia"  placeholder={"Duración meses"} onChange={(e)=>{
          setServDura(e.target.value);
          calculoVto(document.getElementById("fechaInput").value ,e.target.value);
        }}/>

        <label className = "etiquita">$</label>
        <input type='number' id="precioInput" name='precioLicencia' placeholder="Precio"  onChange={(e)=>{
          setServPrecio(e.target.value);
          }}/>

        <label>Tipo de Moneda</label>
        <select id="monedaInput" name="monedaLicencia" placeholder= "Peso Argentino" onChange={(e)=>{
          setServMoneda(e.target.value)}}>
            <option>ARS</option>
            <option>USD</option>
            <option>EUR</option>
            <option>N/A</option>

        </select>

        <label>Fecha Vencimiento</label>
        <input type="date" id="vtoInput" name ="vtoLicencia" defaultValue={daten} placeholder='Vto' onChange={(e)=>{
          setServVto(e.target.value)}} />
        

        <label>Código de Factura</label>
        <input type = "text" id="codInput" name="codigoLicencia"  placeholder={"Código de Factura"} onChange={(e)=>{
          setServCod(e.target.value)
        }}/>

        <label id="lblBaja" hidden>Dar Baja</label>
        <input className='cbBaja' type = "checkbox" id="cbBaja" name="cbBaja" hidden onChange={(e) =>{setServBoolBaja(e.target.checked)}}></input>
        <label id="lblNoMolestar" hidden>Ignorar</label>
        <input className='cbBaja' type = "checkbox" id="cbNoMolestar" name="cbNoMolestar" hidden onChange={(e) =>{setServNoMolestar(e.target.checked)}}></input>
        <button style={{display:'none'}} className='btnEliminar' id='btnEliminar' onClick={eliminarServicio}>Eliminar</button>
        <button style={{display:'none'}} className='btnEliminar' id='btnHistorial' onClick={historialServicio}>Historial</button>
      </div>

      <button className='botonGuardar' onClick={agregarServicio}>Agregar</button>

      <div className='filtrosDiv' name="filtrosDiv">
        <label className='lblBasic'> Filtrar por: &nbsp; &nbsp;</label>
        <label className='lblBasic'> Días restantes:  </label>
        <select id='filtroDias' className='filtroSelect' name='filtroSelect1' placeholder='Dias Restantes' onChange={
          filtrarNombres}>
          <option>TODO</option>
          <option className='yellowclass'>-30 DIAS</option>
          <option className='orangeclass'>-15 DIAS</option>
          <option className='redclass'>VENCIDAS</option>
          <option className='greyclass'>DE BAJA</option>
          <option className='blueclass'>PERMANENTE</option>
        </select>
        <label className='lblBasic'> Moneda:  </label>
        <select id='filtroMoneda' className='filtroSelect' name='filtroSelect2' onChange={
          filtrarNombres}>
          <option>TODO</option>
          <option>ARS</option>
          <option>USD</option>
          <option>EUR</option>
          <option>N/A</option>
        </select>

      </div>

      {/* diseño tabla de suscripciones */}
      <div className= "divTablaContenido">
        
      
          {/*renderizar la tabla */}
          <table>
              <thead>
              <tr>
                <th>Licencia</th>
                <th>Descripcion</th>
                <th>Último Pago</th>
                <th>Duración</th>
                <th>Vencimiento</th>
                <th>Precio</th>
                <th>Invoice</th>
                <th className='estadoTable'></th>
              </tr>
            </thead>
            <tbody>
          {servLista.map((val) => {
            return (
              
              <tr>
                {/*llenamos la tabla con los valores del mapeo de servLista, que es donde volcamos la respuesta del /get */}
                <td className='leftearTexto'>{val.licenciaNombre}</td>
                <td className='leftearTexto'>{val.licenciaDesc}</td>
                <td >{val.licenciaFechaAlta.substring(0,10)}</td>
                {/*concatenar meses o mes, segun si el valor es mas de uno o no */}
                <td>{val.licenciaDurac > 1 ? val.licenciaDurac + " meses": val.licenciaDurac + " mes"}</td>
                <td>{val.licenciaExpire.substring(0,10)}</td>
                <td className='leftearTexto'>{val.licenciaPrecio + " " + val.licenciaPrecioMoneda}</td>
                <td className='leftearTexto'>{val.licenciaFacturaN}</td>
                {/* licencia estado cambia de color de background segun su valor(val)*/}
                <td className={quecolorsoy(val.licenciaEstado)}></td>
              </tr>
            )
            
          })}
          </tbody>
          </table>
        </div>
        {/* boton de guardar cambios, debe estar disabled por defecto, 
        y activarse si se agregan nuevos registros/se actualiza uno viejo */}
        <label className='lblBasic' name="estadoTabla" id='labelCambio'>Sin cambios</label>
        <button className='botonGuardar' id='buttonCambio' onClick={guardarCambiosAver}>Guardar Cambios</button>
        <button className='botonForzar' id='buttonCancel' onClick={cancelarCambiosAver}>Cancelar Cambios</button>
        
        <div className='divConfig'>
          <label className='labelConfig'>Configuraciones del Mensaje</label>
          <div className= "formLicenciaNueva">
            <label className='divConfigInner' >Recordar a Area:</label>
            <select id='areaSelectID'>
              <option>Sistemas</option>
            </select>
            <label className='divConfigInner'>Faltando días:</label>
            <input type='number' id="canDiasInput" placeholder="30 Días" defaultValue={30}/>
            <label className='divConfigInner'>Cambiar Asunto a:</label>
            <input className='otroTextInput' type='text' id="otroAsunInput" placeholder="Licencias Pronto a vencer"/>
            <label className='divConfigInner'>Cambiar Mensaje a:</label>
            <input className='otroTextInput' type='text' id="otroTextInput" placeholder="Las licencias que están por..."/>
            
          </div>
          <div className='viaMensajeDiv'>
            <FontAwesomeIcon className='iconoWP' icon={faEnvelope} />
            <input className='cbEditMail' type = "checkbox" id="cbEmail" name="cbEmail" onChange={(e) =>{setServEmailBool(e.target.checked)}}></input>
            <FontAwesomeIcon className='iconoWP' icon={faWhatsapp}/>
            <input className='cbEditMail' type = "checkbox" id="cbWP" name="cbWP" onChange={(e) =>{setServWPBool(e.target.checked)}}></input>
          </div>
          <div>
            <button className='botonForzar' id='buttonForzar' onClick={guardarMailsDatos}>Guardar</button>
            <button className='botonForzar' id='buttonForzar' onClick={cancelarMailsDatos}>Cancelar</button>
            <button className='botonForzar' id='buttonForzar' onClick={forzarEnvioMails}>Forzar mensajes</button>
          </div>
        </div>
        
    </div>
    
  );
}

export default App;