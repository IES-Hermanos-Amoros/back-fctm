require("dotenv").config()
const { parse, format } = require('date-fns');
const { es } = require('date-fns/locale');
const {SAO_Data,SAO_Data_Student, SAO_Data_Company, SAO_Data_FCT} = require("../models/SAO.model")
const puppeteer = require("puppeteer")
const {setTimeout} = require("node:timers/promises")
const TIEMPO_ESPERA = 5000
const urlBase = process.env.SAO_URL_BASE
const cursoSAO = process.env.SAO_CURSO
const cheerio = require("cheerio")
const userManagerModel = require("../models/userManager.model")
const fctManagerModel = require("../models/fctManager.model")

//const SAO_Data = require("../models/SAO.model")
const puppeteerOptions = {
    headless: true, //false para mostrar navegador, true para no mostrarlo
    devtools: false,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1280x1696'
    ]
}

desconectarSockets = (io) => {
    //Desconectar el primer socket conectado
    const sockets = io.sockets.sockets;            
    // Verificamos que haya al menos un socket conectado
    if (sockets.size > 0) {
        const firstSocket = Array.from(sockets.values())[0]; // Obtener el primer socket conectado
        // Verificar si el socket está conectado antes de intentar desconectarlo
        if (firstSocket && firstSocket.connected) {
            console.log("Desconectado el primer socket")
            firstSocket.disconnect();  // Desconectar el socket
        } else {
            console.warn('El primer socket no está conectado o no existe.');
        }
    } else {
        console.warn('No hay sockets conectados.');
    }
}

//Formatear fecha
stringToDate = (dateString) => {
    const parsedDate = dateString 
    ? parse(dateString, 'dd/MM/yyyy', new Date()) 
    : null;

    /*const formattedDate = parsedDate 
    ? format(parsedDate, 'dd/MM/yyyy HH:mm:ss') 
    : '';*/

    // Si parsedDate es válido, lo formatea al formato ISO 8601 (Aceptado por Mongoose - MongoDB)
    const formattedDate = parsedDate
        ? format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss") // Formato ISO 8601
        : null;

    return formattedDate
}

//Funciones auxiliares
eliminarCookies = async(page) => {
    const cookies = await page.cookies();
    await page.deleteCookie(...cookies);    
    console.log('Todas las cookies han sido eliminadas');
}

extraerDatosEmpresa = ($) => {
    const tablaEmpresa = $('table.infoUsuario.infoEmpresa');    
    const datos = {};
    if (tablaEmpresa.length > 0) {
        // Si la tabla existe, extraemos los datos
        // Extraemos los datos de cada fila
        tablaEmpresa.find('tr').each((i, tr) => {
            const tds = $(tr).find('td');
            if (tds.length > 0) {
                // Si hay celdas (filas con datos)
                const encabezados = $(tr).prev().find('th');
                const valores = tds.map((i, td) => $(td).text().trim()).get();
                
                // Guardamos los valores en el objeto de datos
                if (i === 1) { // La primera fila contiene los datos importantes                    
                    datos.SAO_id = valores[0];
                    datos.SAO_name = valores[1];
                    datos.SAO_company_address = valores[2];
                    datos.SAO_company_state = valores[3];
                    datos.SAO_company_city = valores[4];
                    datos.SAO_company_codeState = valores[5];
                }
                if (i === 3) { // La segunda fila tiene más datos                   
                    datos.SAO_phone = valores[0];
                    datos.SAO_company_fax = valores[1];
                    datos.SAO_company_activity = valores[2];
                    datos.SAO_company_nameManager = valores[3];
                    datos.SAO_company_idManager = valores[4];
                    datos.SAO_email = valores[5];
                    datos.SAO_organization = valores[6]; //Tipo Pública - Privada
                }
                if (i === 5) { // La tercera fila tiene más datos
                    datos.SAO_company_notaryState = valores[0];
                    datos.SAO_company_notaryCity = valores[1];
                    datos.SAO_company_notaryName = valores[2];
                    datos.SAO_company_deedDate = stringToDate(valores[3])
                    datos.SAO_company_protocolNumber = valores[4];
                }
            }
        })
       
        // Datos fuera de la tabla (sólo aparecen cuando accedes desde la tabla, no desde la ficha de la empresa)
        datos.SAO_company_FCT_Number = $('#tdNumConciertoEmp').text().trim();
        datos.SAO_company_FCT_Date = stringToDate($('#tdFechaConciertoEmp').text().trim())
        datos.SAO_company_FPDual_Number = $('#tdNumConciertoDualEmp').text().trim();
        datos.SAO_company_FPDual_Date = stringToDate($('#tdFechaConciertoDualEmp').text().trim())
        //Datos por defecto
        datos.SAO_profile = "EMPRESA"
        datos.SAO_username = datos.SAO_id
        
    }
    return datos
}

extraerDatosAlumno = ($) => {
    const datos = {
        SAO_username: $('th:contains("Usuario/a (Nick):")').next('td').text().trim(),
        SAO_name: $('th:contains("Nombre")').next('td').text().trim(),
        /*SAO_id: $('th:contains("NIF:")').next('td').text().trim(),
        SAO_student_id: $('th:contains("NIA:")').next('td').text().trim(),*/
        SAO_student_id: $('th:contains("NIF:")').next('td').text().trim(),
        SAO_id: $('th:contains("NIA:")').next('td').text().trim(),
        SAO_student_socialNumber: $('th:contains("NUSS:")').next('td').text().trim(),
        SAO_phone: $('th:contains("Teléfonos:")').next('td').text().trim(),
        SAO_email: $('th:contains("E-mail:")').next('td').text().trim(),
        SAO_student_address: $('th:contains("Dirección:")').next('td').text().trim(),
        SAO_student_state: $('th:contains("Provincia:")').next('td').text().trim(),
        SAO_student_city: $('th:contains("Localidad:")').next('td').text().trim(),
        SAO_student_codeState: $('th:contains("Código postal:")').next('td').text().trim(),
        SAO_student_gender: $('th:contains("Sexo:")').next('td').text().trim(),
        SAO_student_visibleCompanies: $('th:contains("Visible empresas:")').next('td').text().trim(),
        SAO_registryDate: stringToDate($('th:contains("Registrado")').next('td').text().trim()),
        SAO_accessDate: stringToDate($('th:contains("acceso")').next('td').text().trim()),
        SAO_profile:"ALUMNO",
        SAO_organization:"IES HA",
        SAO_group:"STUDENTS"
    }
    return datos    
}

extraerDatosProfesorAdmin = ($) => {
    const datos = {
        SAO_username: $('th:contains("Usuario/a (Nick):")').next('td').text().trim(),
        SAO_name: $('th:contains("Nombre")').next('td').text().trim(),
        SAO_id: $('th:contains("NIF:")').next('td').text().trim(),
        SAO_organization: $('th:contains("Departamento:")').next('td').text().trim(),        
        SAO_group:$('th:contains("Grupo:")').next('td').text().trim(),        
        SAO_phone: $('th:contains("Teléfono:")').next('td').text().trim(),
        SAO_email: $('th:contains("E-mail:")').next('td').text().trim(),
        SAO_registryDate: stringToDate($('th:contains("Registrado")').next('td').text().trim()),
        SAO_accessDate: stringToDate($('th:contains("acceso")').next('td').text().trim()),
        SAO_profile:$('th:contains("Tipo de usuario/a:")').next('td').text().trim().includes("Administrador")?"ADMINISTRADOR":"PROFESOR"
    }
    return datos
}

extraerDatosFCT = ($, idFct) => {
    const datos = {
        SAO_fct_id: idFct,
        SAO_student_course: $('td:contains("Ciclo/PCPI:")').next().text().trim(),
        //SAO_student_id: $('td:contains("NIA")').next().text().trim(),
        SAO_student_id: $('#seccionAlumnoDatos table tr').eq(1).find('td').eq(1).text().trim(),  //NIA
        SAO_company_id: $('th:contains("CIF")').parent().next().find('td').eq(0).text().trim(),
        SAO_workcenter_name: $('td:contains("Centro de trabajo")').parent().next().find('td').eq(1).text().trim(),
        SAO_workcenter_city: $('td:contains("Localidad:")').next().text().trim(),
        SAO_workcenter_phone: $('td:contains("Teléfono:")').eq(1).next().text().trim(),
        SAO_workcenter_email: $('td:contains("E-mail:")').eq(1).next().text().trim(),
        SAO_workcenter_manager: $('td:contains("Representante:")').next().text().trim(),
        SAO_workcenter_manager_id: $('td:contains("NIF Rep.:")').next().text().trim(),
         // NIF del tutor del centro educativo
        SAO_teacher_id: $('#seccionTutorDatos table tr').eq(1).find('td').eq(0).text().trim(),        
        SAO_instructor_name: $('td:contains("Instructor/a:")').next().text().trim(),
        SAO_instructor_id: $('td:contains("NIF/NIE Inst.:")').next().text().trim(),
        SAO_period: $('td:contains("Periodo:")').next().text().trim(),
        SAO_dates: $('td:contains("Inicio - Fin:")').next().text().trim(),
        SAO_schedule: $('td:contains("Horario:")').next().text().trim(),
        SAO_hours: $('td:contains("Horas realiz.:")').next().text().trim(),
        SAO_department: $('td:contains("Departamento:")').next().text().trim(),
        SAO_type: $('td:contains("Tipo:")').next().text().trim(),
        SAO_Authorization: $('td:contains("Autorización")').next().text().trim(),
        SAO_Erasmus: $('td:contains("Erasmus/Eurotrainee:")').next().text().trim(),
        SAO_termination_date: stringToDate($('td:contains("Fecha de cese:")').next().text().trim()),
        SAO_instructor_assessment: $('td:contains("Valoración de Instructor/a:")').next().text().trim(),
        SAO_observation: $('td:contains("Observaciones:")').next().text().trim(),
        //SAO_variation: $('td:contains("Variedad")').next().text().trim(),
        SAO_variation: $('.tablaDetallesFCT td:contains("Variedad")').next().text().trim(),
        SAO_link: $('td:contains("Vinculación:")').next().text().trim(),
        SAO_amount: $('td:contains("Importe")').next().text().trim()
    };
    return datos;
};


loginSAO = async(userData,result) => {
    try {
        const browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.goto(urlBase + 'index.php', { waitUntil: 'networkidle2' });
        await eliminarCookies(page)
        //await setTimeout(TIEMPO_ESPERA);

        console.log(userData)

        await page.type('input[name=usuario]', userData.username)        
        await page.type('input[name=password]', userData.password)

        await page.click('input[name=login]');
        
        // Esperar que el div de error aparezca (hasta 3 segundos)
        try {
            await page.waitForSelector('#div_error_login p', { timeout: 3000 });

            // Extraer el mensaje del primer <p> dentro del div de error
            const errorMessage = await page.evaluate(() => {
                const errorParagraph = document.querySelector('#div_error_login p');
                return errorParagraph ? errorParagraph.innerText : null;
            });

            if(errorMessage){
                console.log(`❌ Error detectado: ${errorMessage}`);
                //throw new Error(`401 - Error detectado: ${errorMessage}`)
                //result(errorMessage,null)
                //return false
                return { error:errorMessage, ok:false, page:null }
            }
        } catch (error) {
            if(error.message.startsWith("401")){
                throw new Error(error)
            }
            console.log('✅ Login exitoso.')
            //return true
            //result(null,"ok")
            return { error:null, ok:true, page:page }
        }
    } catch (error) {
        console.log(`❌ Error detectado: ${error.message}`);
        //result(error.message,null)
        return { error:error.message, ok:false, page:null }
    }
}

getSAOCompaniesLinks = async(page) => {
    let companiesLinks = []
    await page.goto(urlBase + "index.php?op=4&subop=0", { waitUntil: 'networkidle2' })
    const content = await page.content();
    const $ = cheerio.load(content);

    // Obtener todos los números de las páginas
    const pageNumbers = [];
    $('.parrafoPaginador a.enlacePag').each((index, element) => {
        const pageNumber = $(element).text().trim();
        if (!isNaN(pageNumber)) {
            pageNumbers.push(parseInt(pageNumber));
        }
    });

    // Obtener el máximo número de página
    const maxPage = Math.max(...pageNumbers);
    console.log(`El número máximo de páginas es: ${maxPage}`);
    const incremento = 100/maxPage

    for(let numPag=1; numPag <= maxPage; numPag++){
        try {
            await page.goto(urlBase + "index.php?op=4&subop=0&pag=" + numPag, { waitUntil: 'networkidle2' })
            const content = await page.content();
            const $ = cheerio.load(content);
            const allRows = $('table.tablaListadoFCTs > tbody > tr');
            allRows.each((index, element) => {                
                const tds = $(element).find('td a');
                const registrado = $(element).find('td').eq(11).text().trim(); // Columna "Registrado"
                const ultimoAcceso = $(element).find('td').eq(12).text().trim(); // Columna "Últ. acceso"

                if($(tds[0]).attr('href')){
                    companiesLinks.push({                    
                        link:urlBase + $(tds[0]).attr('href'),
                        registrado:registrado,
                        ultimoAcceso:ultimoAcceso
                    })
                    //console.log($(tds[0]).attr('href'))
                }
            })
        } catch (error) {
            console.log("ERRORRRRRRRRRRRR: " + error)
        }
    }
    return companiesLinks
}

getSAOTeachersLinks = async(page) => {
    let links = []
    await page.goto(urlBase + "index.php?op=5&subop=0", { waitUntil: 'networkidle2' })
    const content = await page.content();
    const $ = cheerio.load(content);

    // Obtener todos los números de las páginas
    const pageNumbers = [];
    $('.parrafoPaginador a.enlacePag').each((index, element) => {
        const pageNumber = $(element).text().trim();
        if (!isNaN(pageNumber)) {
            pageNumbers.push(parseInt(pageNumber));
        }
    });

    // Obtener el máximo número de página
    const maxPage = Math.max(...pageNumbers);
    console.log(`El número máximo de páginas es: ${maxPage}`);
    const incremento = 100/maxPage

    for(let numPag=1; numPag <= maxPage; numPag++){
        try {
            await page.goto(urlBase + "index.php?op=5&subop=0&pag=" + numPag, { waitUntil: 'networkidle2' })
            const content = await page.content();
            const $ = cheerio.load(content);
            const allRows = $('table.tablaListadoFCTs > tbody > tr');
            allRows.each((index, element) => {                
                const tds = $(element).find('td a');
                const registrado = $(element).find('td').eq(12).text().trim(); // Columna "Registrado"
                const ultimoAcceso = $(element).find('td').eq(13).text().trim(); // Columna "Últ. acceso"

                if($(tds[0]).attr('href')){
                    links.push({                    
                        link:urlBase + $(tds[0]).attr('href'),
                        registrado:registrado,
                        ultimoAcceso:ultimoAcceso
                    })
                }
            })
        } catch (error) {
            console.log("ERRORRRRRRRRRRRR: " + error)
        }
    }
    return links
}

getSAOStudentsLinks = async(page) => {
    let links = []
    await page.goto(urlBase + "index.php?op=3&subop=0", { waitUntil: 'networkidle2' })
    const content = await page.content();
    const $ = cheerio.load(content);

    // Obtener todos los números de las páginas
    const pageNumbers = [];
    $('.parrafoPaginador a.enlacePag').each((index, element) => {
        const pageNumber = $(element).text().trim();
        if (!isNaN(pageNumber)) {
            pageNumbers.push(parseInt(pageNumber));
        }
    });

    // Obtener el máximo número de página
    const maxPage = Math.max(...pageNumbers);
    console.log(`El número máximo de páginas es: ${maxPage}`);
    const incremento = 100/maxPage

    for(let numPag=1; numPag <= maxPage; numPag++){
        try {
            await page.goto(urlBase + "index.php?op=3&subop=0&pag=" + numPag, { waitUntil: 'networkidle2' })
            const content = await page.content();
            const $ = cheerio.load(content);
            const allRows = $('table.tablaListadoFCTs > tbody > tr');
            allRows.each((index, element) => {                
                const tds = $(element).find('td a');
                const registrado = $(element).find('td').eq(5).text().trim(); // Columna "Registrado"
                const ultimoAcceso = $(element).find('td').eq(6).text().trim(); // Columna "Últ. acceso"

                if($(tds[0]).attr('href')){
                    links.push({                    
                        link:urlBase + $(tds[0]).attr('href'),
                        registrado:registrado,
                        ultimoAcceso:ultimoAcceso
                    })
                }
            })
        } catch (error) {
            console.log("ERRORRRRRRRRRRRR: " + error)
        }
    }
    return links
}

getSAOFCTLinks = async(page, todas=false) => {
    let links = []
    let maxPage = 1
    await page.goto(urlBase + "index.php?op=2&subop=0", { waitUntil: 'networkidle2' })
    const content = await page.content();
    const $ = cheerio.load(content);


    console.log("TODAS LAS FCTs: ", todas)

    // Si el parámetro todas es true, hacer clic en el botón "Todas"
    if (todas) {
        try {            
            const botonTodas = await page.$('button.botonSelec');
            if (botonTodas) {
                //await botonTodas.click();
                //await page.click('button.botonSelec');
                 // Ejecutar directamente la función que carga "Todas" las FCT
                await page.evaluate(() => {
                    muestraTodasFCTByPeriodo('seccion=consultar_fct');
                });
                //await botonTodas.click();
                //await botonTodas.click();
                //await page.waitForSelector('table.tablaListadoFCTs'); 
                console.log("Se hizo clic en el botón 'Todas'");

                 // Esperar hasta que el contenedor FCT se recargue
                //await page.waitForSelector('#contenedorFCT', { visible: true }); // Espera que el contenedor esté visible

                // Puedes agregar un pequeño tiempo de espera si el contenedor se recarga de manera asincrónica
                //await page.waitForTimeout(2000); // Espera 2 segundos adicionales si es necesario
                //await setTimeout(TIEMPO_ESPERA);

                // Esperar a que cambie el contenido del contenedor
                console.log("Clic en 'Todas'... esperando recarga del contenedor");

                // Esperar a que aparezca la paginación (la prueba de que el contenido está cargado)
                await page.waitForFunction(() => {
                    const paginador = document.querySelectorAll('.parrafoPaginador a.enlacePag');
                    return paginador.length > 0;
                }, { timeout: 10000 });

                // Obtener número total de páginas
                maxPage = await page.evaluate(() => {
                    const enlaces = Array.from(document.querySelectorAll('.parrafoPaginador a.enlacePag'));
                    const numeros = enlaces.map(el => parseInt(el.textContent)).filter(n => !isNaN(n));
                    return Math.max(...numeros);
                });

                console.log("Total de Páginas: " + maxPage)

                console.log("La paginación ya está presente en el DOM.");           

                console.log("El contenedor FCT se ha recargado.");

            } else {
                console.log("No se encontró el botón 'Todas'");
            }
            
        } catch (error) {
            console.log("Error al intentar hacer clic en el botón 'Todas': ", error);
        }
    }

    const incremento = 100/maxPage

    for (let numPag = 1; numPag <= maxPage; numPag++) {
        try {
            // Simula la llamada AJAX para cargar la página correspondiente
            if(todas){ //En el caso que tengamos que paginar
                await page.evaluate((pagina, cursoSAOInsideBrowser) => {
                    console.log("Curso SAO: ", cursoSAOInsideBrowser)
                    const url = `/inc/ajax/fcts/rellenar_fct.php?curso=${cursoSAOInsideBrowser}&periodo=-1&pag=${pagina}`;
                    muestraAjaxDiv(url, 'contenedorFCT');
                }, numPag, cursoSAO);
            }
    
            // Espera a que el DOM se actualice con la nueva página
            await page.waitForFunction((pagina) => {
                const actual = document.querySelector('.parrafoPaginador .enlacePagSelec');
                return actual && actual.textContent.trim() === pagina.toString();
            }, {}, numPag);
    
            // Extrae el contenido del contenedor actualizado
            const content = await page.$eval('#contenedorFCT', el => el.innerHTML);
            const $ = cheerio.load(content);
    
            const allRows = $('table.tablaListadoFCTs > tbody > tr');
            allRows.each((index, element) => {
                const aModificar = $(element).find('td:last-child a[title="Modificar"]');
                if (aModificar.length > 0) {
                    const href = aModificar.attr('href');
                    if (href) {
                        const urlParams = new URLSearchParams(href.split('?')[1]);
                        const idFct = urlParams.get('idFct');
                        links.push({
                            link: urlBase + href,
                            idFct: idFct
                        });
                    }
                }
            });
    
        } catch (error) {
            console.log("ERROR en la página " + numPag + ": " + error);
        }
    }

    console.log(links)

    return links
}

//------------------------------------------------------------
exports.loginService = async(userData,result) => {
    const respLogin = await loginSAO(userData) 

    if(respLogin.ok) {

        const page = respLogin.page

        await page.goto(urlBase + 'index.php?op=1', { waitUntil: 'networkidle2' });
        const content = await page.content();
        const $ = cheerio.load(content);

        // Verificamos si existe la tabla "Usuario/a" con la clase "infoUsuarioCab"
        const usuarioDisponible = $('.infoUsuarioCab').filter(function() {
            return $(this).text().includes("Usuario/a");
        }).length > 0;

        // Verificamos si existe la tabla "Personales" con la clase "infoUsuarioCab"
        const personalesDisponible = $('.infoUsuarioCab').filter(function() {
            return $(this).text().includes("Personales");
        }).length > 0;

        let resBack = {
            error:"ERROR",
            msg:"No hay datos disponibles"
        }

        if(usuarioDisponible && personalesDisponible){
            //ESTAMOS ACCEDIENDO COMO USUARIO (Profesor, Alumno, Administrador)                
            const tipoUsuario = $('th:contains("Tipo de usuario/a:")').next('td').text().trim();
            if (tipoUsuario.includes("Profesor")){
                //PROFESOR
                const datos = extraerDatosProfesorAdmin($)
                if(datos){
                    resBack = new SAO_Data(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone)
                }

            } else if(tipoUsuario == ""){
                //ALUMNO                
                const datos = extraerDatosAlumno($)            
                if (datos){
                    resBack = new SAO_Data_Student(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone, datos.SAO_student_id, datos.SAO_student_socialNumber, datos.SAO_student_city, datos.SAO_student_state, datos.SAO_student_codeState, datos.SAO_student_address, datos.SAO_student_gender, datos.SAO_student_visibleCompanies)
                }       
            }                
            
        } else {
            //EMPRESA            
            const datos = extraerDatosEmpresa($)
            //Fechas de Registro y Acceso NO aparecen en la Ficha de la Empresa (sólo en la tabla)            
            if (datos){
                //resBack = new SAO_Data_Company(datos.CIF,"EMPRESA",datos.CIF,"","",datos.Nombre,datos.Tipo,null,datos.Email,datos.Telefono,datos.numConciertoEmp,stringToDate(datos.fechaConciertoEmp),datos.numConciertoDualEmp,stringToDate(datos.fechaConciertoDualEmp),datos.Fax,datos.Localidad,datos.Provincia,datos.CP,datos.Direccion,datos.Actividad,datos.NombreGerente,datos.NIFGerente,datos.ProvinciaNotaria,datos.LocalidadNotaria,datos.NombreNotario, datos.NumeroProtocolo,stringToDate(datos.FechaEscritura))
                resBack = new SAO_Data_Company(datos.SAO_id, datos.SAO_profile, datos.SAO_username, "", "", datos.SAO_name, datos.SAO_organization, null, datos.SAO_email, datos.SAO_phone, datos.SAO_company_FCT_Number, datos.SAO_company_FCT_Date, datos.SAO_company_FPDual_Number, datos.SAO_company_FPDual_Date, datos.SAO_company_fax, datos.SAO_company_city, datos.SAO_company_state, datos.SAO_company_codeState, datos.SAO_company_address, datos.SAO_company_activity, datos.SAO_company_nameManager, datos.SAO_company_idManager, datos.SAO_company_notaryState, datos.SAO_company_notaryCity, datos.SAO_company_notaryName, datos.SAO_company_protocolNumber, datos.SAO_company_deedDate);
            }
        }

        //DEVOLUCION DE LA RESPUESTA
        console.log(resBack)
        result(null,resBack)
    } else {
        //ERROR DE LOGIN
        result(respLogin.error,null)
    }     
}

//----------------------------------------------------------------
exports.companiesSinc = async(io,res,userData,result) => {
    //res.write('Login...\n');
    //res.write('data: {"message": "Login..."}\n\n');
    const respLogin = await loginSAO(userData) 

    if(respLogin.ok) {          
        let progress = 0;    
        //res.write('data: {"message": "Login OK..."}\n\n');
        //res.write('data: {"message": "Cargando empresas de la BBDD local (MongoDB)..."}\n\n');
        const empresasMongoDB = await userManagerModel.findByFilter({SAO_profile:"EMPRESA"})
        console.log("Empresas en MongoDB: ",empresasMongoDB.length)
        io.emit('progress-update', { progress, message:`Empresas en MongoDB: ${empresasMongoDB.length}` });
        //res.write(`data: {"message": "Empresas Totales en BBDD local (MongoDB):${empresasMongoDB.length}"}\n\n`);
        const page = respLogin.page
        //res.write('Obteniendo links de empresas...\n');  
        //res.write('data: {"message": "Obteniendo Links de Empresas..."}\n\n');
        const companiesLinks = await getSAOCompaniesLinks(page)
        console.log("Empresas en SAO: ",companiesLinks.length)
        io.emit('progress-update', { progress, message:`Empresas en SAO: ${companiesLinks.length}` });

        let incremento = 100/companiesLinks.length
        //res.write('Links de empresas totales:' + companiesLinks.length + '\n');  
        //res.write(`data: {"message": "Links de Empresas Totales:${companiesLinks.length}"}\n\n`);
        //Una vez tenemos los links de las empresas, vamos recorriendo, y abriendo, uno a uno para extraer su información
        let companiesInfo = {
            newCompanies:[],
            updatedCompanies:[]
        }

        for(let companyLink of companiesLinks){
            try {
                if(companyLink.link){
                    //await setTimeout(TIEMPO_ESPERA);       
                    await page.goto(companyLink.link, { waitUntil: 'networkidle2' })

                    const content = await page.content();
                    const $ = cheerio.load(content);
                    
                    const datos = extraerDatosEmpresa($)
                    if(datos){
                        progress += incremento;
                        io.emit('progress-update', { progress, message:`Cargando empresa '${datos.SAO_id + " " +  datos.SAO_name}'...` });
                        //console.log(datos)
                        datos.SAO_registryDate = stringToDate(companyLink.registrado)
                        datos.SAO_accessDate = stringToDate(companyLink.ultimoAcceso)                        
                        //res.write(`Empresa SAO: ${JSON.stringify(datos)}\n\n`);
                        //Si tenemos datos de la empresa, voy a comprobar si existe en MongoDB
                        const empresaEnMongo = empresasMongoDB.find(emp => emp.SAO_id === datos.SAO_id);
                        //console.log(empresaEnMongo)                        
                        //Si NO existe en mongoDB, será una nueva empresa
                        if(!empresaEnMongo){
                            console.log(datos)
                            companiesInfo.newCompanies.push(new SAO_Data_Company(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, null, datos.SAO_email, datos.SAO_phone, datos.SAO_company_FCT_Number, datos.SAO_company_FCT_Date, datos.SAO_company_FPDual_Number, datos.SAO_company_FPDual_Date, datos.SAO_company_fax, datos.SAO_company_city, datos.SAO_company_state, datos.SAO_company_codeState, datos.SAO_company_address, datos.SAO_company_activity, datos.SAO_company_nameManager, datos.SAO_company_idManager, datos.SAO_company_notaryState, datos.SAO_company_notaryCity, datos.SAO_company_notaryName, datos.SAO_company_protocolNumber, datos.SAO_company_deedDate));
                        } else {
                            //Si Existe en MongoDB, comprobamos si se ha modificado algún campo                            
                            console.log(datos.SAO_id + " " +  datos.SAO_name)                            
                            const SAO_MODIFIED_FIELDS = Object.keys(datos).filter(key => {
                                // Comprobamos si el campo es de tipo Date                               
                                if (empresaEnMongo[key] instanceof Date) {
                                    // Convertimos datos[key] a un objeto Date (si es una cadena con formato válido)
                                    const fechaDatos = new Date(datos[key]);                            
                                    // Comprobamos si la conversión fue exitosa (es decir, si no es una fecha inválida)
                                    if (isNaN(fechaDatos)) {
                                        // Si datos[key] no es una fecha válida, lo tratamos como una cadena
                                        return String(empresaEnMongo[key]).trim() !== String(datos[key]).trim();
                                    }                            
                                    // Comparamos las fechas: empresaEnMongo es un Date, datos[key] es ahora un Date
                                    return empresaEnMongo[key].getTime() !== fechaDatos.getTime();
                                }
                                
                                // Si no es de tipo Date, seguimos la comparación de cadenas
                                return (String(empresaEnMongo[key] || "").trim()) !== (String(datos[key] || "").trim());
                            }).map(key => {
                                return {
                                    field: key,
                                    DB_Value: empresaEnMongo[key],
                                    SAO_Value: datos[key]
                                };
                            });
                              
                            //Si se ha modificado, añadimos la empresa
                            if (SAO_MODIFIED_FIELDS.length > 0) {
                                console.log(SAO_MODIFIED_FIELDS)
                                // Si hay campos modificados, añadimos la empresa a updatedCompanies con los campos modificados
                                const empresaModificada = { ...new SAO_Data_Company(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, null, datos.SAO_email, datos.SAO_phone, datos.SAO_company_FCT_Number, datos.SAO_company_FCT_Date, datos.SAO_company_FPDual_Number, datos.SAO_company_FPDual_Date, datos.SAO_company_fax, datos.SAO_company_city, datos.SAO_company_state, datos.SAO_company_codeState, datos.SAO_company_address, datos.SAO_company_activity, datos.SAO_company_nameManager, datos.SAO_company_idManager, datos.SAO_company_notaryState, datos.SAO_company_notaryCity, datos.SAO_company_notaryName, datos.SAO_company_protocolNumber, datos.SAO_company_deedDate), SAO_MODIFIED_FIELDS };
                                companiesInfo.updatedCompanies.push(empresaModificada);
                            }                            
                        }
                    }                    
                    
                    
                }
            } catch (error) {
                console.log("Error leyendo una empresa: " + companyLink.link + ". Desc: " + error.message)
                io.emit('progress-update', { progress, message:"Error cargando info de empresas: "  + companyLink.link + ". Desc: " + error.message });       
            } /*finally {
                desconectarSockets(io)
            }*/
        }
        
        //res.write('data: {"message": "Proceso completado."}\n\n');
        //res.end()
        io.emit('progress-update', { progress:100, message:"Proceso completado." });
        desconectarSockets(io)       
        result(null,companiesInfo)

    } else {
        //ERROR DE LOGIN
        //res.write('data: {"error": "Hubo un error en el proceso."}\n\n');
        //res.end()
        io.emit('progress-update', { progress:100, message:"Error de login: "  + respLogin.error });
        desconectarSockets(io)       
        result(respLogin.error,null)
    }  
}



exports.teachersSinc = async(io,res,userData,result) => {
    const respLogin = await loginSAO(userData) 

    if(respLogin.ok) {          
        let progress = 0;
        const profesMongoDB = await userManagerModel.findByFilter({SAO_profile: { $in: ["PROFESOR", "ADMINISTRADOR"] }})
        console.log("Profesores en MongoDB: ",profesMongoDB.length)
        io.emit('progress-update', { progress, message:`Profesores en MongoDB: ${profesMongoDB.length}` });
        const page = respLogin.page
        const teachersLinks = await getSAOTeachersLinks(page)
        console.log("Profesores en SAO: ",teachersLinks.length)
        io.emit('progress-update', { progress, message:`Profesores en SAO: ${teachersLinks.length}` });

        let incremento = 100/teachersLinks.length
        //res.write('Links de empresas totales:' + companiesLinks.length + '\n');  
        //res.write(`data: {"message": "Links de Empresas Totales:${companiesLinks.length}"}\n\n`);
        //Una vez tenemos los links de las empresas, vamos recorriendo, y abriendo, uno a uno para extraer su información
        let teachersInfo = {
            newTeachers:[],
            updatedTeachers:[]
        }

        for(let teacherLink of teachersLinks){
            try {
                if(teacherLink.link){
                    //await setTimeout(TIEMPO_ESPERA);       
                    await page.goto(teacherLink.link, { waitUntil: 'networkidle2' })

                    const content = await page.content();
                    const $ = cheerio.load(content);
                    
                    const datos = extraerDatosProfesorAdmin($)
                    if(datos){
                        progress += incremento;
                        io.emit('progress-update', { progress, message:`Cargando profesor '${datos.SAO_profile + ": " + datos.SAO_id + " " +  datos.SAO_name}'...` });
                        //console.log(datos)
                        //datos.SAO_registryDate = stringToDate(companyLink.registrado)
                        //datos.SAO_accessDate = stringToDate(companyLink.ultimoAcceso)                        
                        //res.write(`Empresa SAO: ${JSON.stringify(datos)}\n\n`);
                        //Si tenemos datos de la empresa, voy a comprobar si existe en MongoDB
                        const profeEnMongo = profesMongoDB.find(profe => profe.SAO_id === datos.SAO_id);
                        //console.log(empresaEnMongo)                        
                        //Si NO existe en mongoDB, será una nueva empresa
                        if(!profeEnMongo){
                            console.log(datos)
                            teachersInfo.newTeachers.push(new SAO_Data(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone));
                        } else {
                            //Si Existe en MongoDB, comprobamos si se ha modificado algún campo                            
                            console.log(datos.SAO_id + " " +  datos.SAO_name)                            
                            const SAO_MODIFIED_FIELDS = Object.keys(datos).filter(key => {
                                // Comprobamos si el campo es de tipo Date                               
                                if (profeEnMongo[key] instanceof Date) {
                                    // Convertimos datos[key] a un objeto Date (si es una cadena con formato válido)
                                    const fechaDatos = new Date(datos[key]);                            
                                    // Comprobamos si la conversión fue exitosa (es decir, si no es una fecha inválida)
                                    if (isNaN(fechaDatos)) {
                                        // Si datos[key] no es una fecha válida, lo tratamos como una cadena
                                        return String(profeEnMongo[key]).trim() !== String(datos[key]).trim();
                                    }                            
                                    // Comparamos las fechas: empresaEnMongo es un Date, datos[key] es ahora un Date
                                    return profeEnMongo[key].getTime() !== fechaDatos.getTime();
                                }
                                
                                // Si no es de tipo Date, seguimos la comparación de cadenas
                                return (String(profeEnMongo[key] || "").trim()) !== (String(datos[key] || "").trim());
                            }).map(key => {
                                return {
                                    field: key,
                                    DB_Value: profeEnMongo[key],
                                    SAO_Value: datos[key]
                                };
                            });
                              
                            //Si se ha modificado, añadimos la empresa
                            if (SAO_MODIFIED_FIELDS.length > 0) {
                                console.log(SAO_MODIFIED_FIELDS)
                                // Si hay campos modificados, añadimos la empresa a updatedCompanies con los campos modificados
                                const profesorModificado = { ...new SAO_Data(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone), SAO_MODIFIED_FIELDS };
                                teachersInfo.updatedTeachers.push(profesorModificado);
                            }                            
                        }
                    }                    
                    
                    
                }
            } catch (error) {
                console.log("Error leyendo un profesor: " + teacherLink.link + ". Desc: " + error.message)
                io.emit('progress-update', { progress, message:"Error leyendo info de profesor: "  + teacherLink.link + ". Desc: " + error.message });       
            } 
        }
        

        io.emit('progress-update', { progress:100, message:"Proceso completado." });
        desconectarSockets(io)       
        result(null,teachersInfo)

    } else {
        //ERROR DE LOGIN
        //res.write('data: {"error": "Hubo un error en el proceso."}\n\n');
        //res.end()
        io.emit('progress-update', { progress:100, message:"Error de login: "  + respLogin.error });
        desconectarSockets(io)       
        result(respLogin.error,null)
    }  
}


exports.studentsSinc = async(io,res,userData,result) => {
    const respLogin = await loginSAO(userData) 

    if(respLogin.ok) {          
        let progress = 0;
        const alusMongoDB = await userManagerModel.findByFilter({SAO_profile:"ALUMNO"})
        console.log("Alumnos en MongoDB: ",alusMongoDB.length)
        io.emit('progress-update', { progress, message:`Alumnos en MongoDB: ${alusMongoDB.length}` });
        const page = respLogin.page
        const studentsLinks = await getSAOStudentsLinks(page)
        console.log("Alumnos en SAO: ",studentsLinks.length)
        io.emit('progress-update', { progress, message:`Alumnos en SAO: ${studentsLinks.length}` });

        let incremento = 100/studentsLinks.length
        //Una vez tenemos los links de las empresas, vamos recorriendo, y abriendo, uno a uno para extraer su información
        let studentsInfo = {
            newStudents:[],
            updatedStudents:[]
        }

        for(let studentLink of studentsLinks){
            try {
                if(studentLink.link){
                    //await setTimeout(TIEMPO_ESPERA);       
                    await page.goto(studentLink.link, { waitUntil: 'networkidle2' })

                    const content = await page.content();
                    const $ = cheerio.load(content);
                    
                    const datos = extraerDatosAlumno($)
                    if(datos){
                        progress += incremento;
                        io.emit('progress-update', { progress, message:`Cargando alumno '${datos.SAO_id + " " +  datos.SAO_name}'...` });
                        //console.log(datos)
                        //datos.SAO_registryDate = stringToDate(companyLink.registrado)
                        //datos.SAO_accessDate = stringToDate(companyLink.ultimoAcceso)                        
                        //res.write(`Empresa SAO: ${JSON.stringify(datos)}\n\n`);
                        //Si tenemos datos de la empresa, voy a comprobar si existe en MongoDB
                        const aluEnMongo = alusMongoDB.find(alu => alu.SAO_id === datos.SAO_id);
                        //console.log(empresaEnMongo)                        
                        //Si NO existe en mongoDB, será una nueva empresa
                        if(!aluEnMongo){
                            console.log(datos)
                            //new SAO_Data_Student(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone, datos.SAO_student_id, datos.SAO_student_socialNumber, datos.SAO_student_city, datos.SAO_student_state, datos.SAO_student_codeState, datos.SAO_student_address, datos.SAO_student_gender, datos.SAO_student_visibleCompanies)
                            studentsInfo.newStudents.push(new SAO_Data_Student(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone, datos.SAO_student_id, datos.SAO_student_socialNumber, datos.SAO_student_city, datos.SAO_student_state, datos.SAO_student_codeState, datos.SAO_student_address, datos.SAO_student_gender, datos.SAO_student_visibleCompanies));
                        } else {
                            //Si Existe en MongoDB, comprobamos si se ha modificado algún campo                            
                            console.log(datos.SAO_id + " " +  datos.SAO_name)                            
                            const SAO_MODIFIED_FIELDS = Object.keys(datos).filter(key => {
                                // Comprobamos si el campo es de tipo Date                               
                                if (aluEnMongo[key] instanceof Date) {
                                    // Convertimos datos[key] a un objeto Date (si es una cadena con formato válido)
                                    const fechaDatos = new Date(datos[key]);                            
                                    // Comprobamos si la conversión fue exitosa (es decir, si no es una fecha inválida)
                                    if (isNaN(fechaDatos)) {
                                        // Si datos[key] no es una fecha válida, lo tratamos como una cadena
                                        return String(aluEnMongo[key]).trim() !== String(datos[key]).trim();
                                    }                            
                                    // Comparamos las fechas: empresaEnMongo es un Date, datos[key] es ahora un Date
                                    return aluEnMongo[key].getTime() !== fechaDatos.getTime();
                                }
                                
                                // Si no es de tipo Date, seguimos la comparación de cadenas
                                return (String(aluEnMongo[key] || "").trim()) !== (String(datos[key] || "").trim());
                            }).map(key => {
                                return {
                                    field: key,
                                    DB_Value: aluEnMongo[key],
                                    SAO_Value: datos[key]
                                };
                            });
                              
                            //Si se ha modificado, añadimos la empresa
                            if (SAO_MODIFIED_FIELDS.length > 0) {
                                console.log(SAO_MODIFIED_FIELDS)
                                // Si hay campos modificados, añadimos la empresa a updatedCompanies con los campos modificados
                                const alumnoModificado = { ...new SAO_Data_Student(datos.SAO_id, datos.SAO_profile, datos.SAO_username, datos.SAO_registryDate, datos.SAO_accessDate, datos.SAO_name, datos.SAO_organization, datos.SAO_group, datos.SAO_email, datos.SAO_phone, datos.SAO_student_id, datos.SAO_student_socialNumber, datos.SAO_student_city, datos.SAO_student_state, datos.SAO_student_codeState, datos.SAO_student_address, datos.SAO_student_gender, datos.SAO_student_visibleCompanies), SAO_MODIFIED_FIELDS };
                                studentsInfo.updatedStudents.push(alumnoModificado);
                            }                            
                        }
                    }                    
                    
                    
                }
            } catch (error) {
                console.log("Error leyendo un alumno: " + studentLink.link + ". Desc: " + error.message)
                io.emit('progress-update', { progress, message:"Error leyendo info de alumno: "  + studentLink.link + ". Desc: " + error.message });       
            } 
        }
        

        io.emit('progress-update', { progress:100, message:"Proceso completado." });
        desconectarSockets(io)       
        result(null,studentsInfo)

    } else {
        //ERROR DE LOGIN
        io.emit('progress-update', { progress:100, message:"Error de login: "  + respLogin.error });
        desconectarSockets(io)       
        result(respLogin.error,null)
    }  
}


exports.FCTSinc = async(io,res,userData,result) => {
    const respLogin = await loginSAO(userData) 

    if(respLogin.ok) {          
        let progress = 0;

        //INI TEMPORAL
        const page = respLogin.page
        const fctLinks = await getSAOFCTLinks(page,userData.todasFCTs)
        //result(null,fctLinks)
        //FIN TEMPORAL

        const fctsMongoDB = await fctManagerModel.findByFilter({})
        console.log("FCTs en MongoDB: ",fctsMongoDB.length)
        io.emit('progress-update', { progress, message:`FCTs en MongoDB: ${fctsMongoDB.length}` });
        //const page = respLogin.page
        //const studentsLinks = await getSAOStudentsLinks(page)
        console.log("FCTs en SAO: ",fctLinks.length)
        io.emit('progress-update', { progress, message:`FCTs en SAO: ${fctLinks.length}` });

        let incremento = 100/fctLinks.length
        let FCTInfo = {
            newFCT:[],
            updatedFCT:[]
        }

        
        for(let fctLink of fctLinks){
            try {
                if(fctLink.link){                    
                    await page.goto(fctLink.link, { waitUntil: 'networkidle2' })

                    const content = await page.content();
                    const $ = cheerio.load(content);
                    
                    const datos = extraerDatosFCT($,fctLink.idFct)
                    if(datos){
                        progress += incremento;
                        io.emit('progress-update', { progress, message:`Cargando FCT '${datos.SAO_fct_id + " NIA: " +  datos.SAO_student_id + " CIF: " + datos.SAO_company_id + " Tutor NIF: " + datos.SAO_teacher_id}'...` });                        
                        const fctEnMongo = fctsMongoDB.find(fct => fct.SAO_fct_id === datos.SAO_fct_id);
                        
                        if(!fctEnMongo){
                            console.log(datos)                        
                            FCTInfo.newFCT.push(new SAO_Data_FCT(datos.SAO_fct_id, datos.SAO_student_course, datos.SAO_student_id, datos.SAO_company_id, 
                                                                datos.SAO_workcenter_name, datos.SAO_workcenter_phone, datos.SAO_workcenter_manager, datos.SAO_workcenter_manager_id, datos.SAO_workcenter_city, datos.SAO_workcenter_email,
                                                                datos.SAO_teacher_id, datos.SAO_instructor_name, datos.SAO_instructor_id, datos.SAO_period, datos.SAO_dates, datos.SAO_schedule, datos.SAO_hours, datos.SAO_department, datos.SAO_type, datos.SAO_Authorization, datos.SAO_Erasmus, datos.SAO_termination_date, datos.SAO_instructor_assessment, datos.SAO_observation, datos.SAO_variation, datos.SAO_link, datos.SAO_amount)) 
                            } else {                            
                            console.log(datos.SAO_fct_id + " NIA: " +  datos.SAO_student_id + " CIF: " + datos.SAO_company_id + " Tutor NIF: " + datos.SAO_teacher_id)                            
                            const SAO_MODIFIED_FIELDS = Object.keys(datos).filter(key => {                                
                                if (fctEnMongo[key] instanceof Date) {                                    
                                    const fechaDatos = new Date(datos[key]);                                                                
                                    if (isNaN(fechaDatos)) {                                        
                                        return String(fctEnMongo[key]).trim() !== String(datos[key]).trim();
                                    }                                                                
                                    return fctEnMongo[key].getTime() !== fechaDatos.getTime();
                                }
                                
                                return (String(fctEnMongo[key] || "").trim()) !== (String(datos[key] || "").trim());
                            }).map(key => {
                                return {
                                    field: key,
                                    DB_Value: fctEnMongo[key],
                                    SAO_Value: datos[key]
                                };
                            });
                              
                            if (SAO_MODIFIED_FIELDS.length > 0) {
                                console.log(SAO_MODIFIED_FIELDS)
                                const fctModificada = { ...new SAO_Data_FCT(datos.SAO_fct_id, datos.SAO_student_course, datos.SAO_student_id, datos.SAO_company_id, 
                                                                            datos.SAO_workcenter_name, datos.SAO_workcenter_phone, datos.SAO_workcenter_manager, datos.SAO_workcenter_manager_id, datos.SAO_workcenter_city, datos.SAO_workcenter_email,
                                                                            datos.SAO_teacher_id, datos.SAO_instructor_name, datos.SAO_instructor_id, datos.SAO_period, datos.SAO_dates, datos.SAO_schedule, datos.SAO_hours, datos.SAO_department, datos.SAO_type, datos.SAO_Authorization, datos.SAO_Erasmus, datos.SAO_termination_date, datos.SAO_instructor_assessment, datos.SAO_observation, datos.SAO_variation, datos.SAO_link, datos.SAO_amount), SAO_MODIFIED_FIELDS };
                                FCTInfo.updatedFCT.push(fctModificada);
                            }                            
                        }
                    }                    
                    
                    
                }
            } catch (error) {
                console.log("Error leyendo una fct: " + fctLink.link + ". Desc: " + error.message)
                io.emit('progress-update', { progress, message:"Error leyendo info de alumno: "  + fctLink.link + ". Desc: " + error.message });       
            } 
        }
        

        io.emit('progress-update', { progress:100, message:"Proceso completado." });
        desconectarSockets(io)       
        
        const FCTInfoPopulate = await populateFCTInfo(FCTInfo);
        result(null, FCTInfoPopulate);
        //result(null,FCTInfo)


    } else {
        io.emit('progress-update', { progress:100, message:"Error de login: "  + respLogin.error });
        desconectarSockets(io)       
        result(respLogin.error,null)
    }  
}


// =======================================================
//  🌟 FUNCIÓN AUXILIAR: POPULATE FALSO PARA FCTInfo
// =======================================================
const populateFCTInfo = async (FCTInfo) => {
    try {
        if (!FCTInfo) return FCTInfo;

        // Unir todas las FCT (new y updated)
        const allFCTs = [
            ...FCTInfo.newFCT,
            ...FCTInfo.updatedFCT
        ];

        if (allFCTs.length === 0) return FCTInfo;

        // Obtener todos los SAO_id necesarios
        const companyIds = allFCTs.map(f => f.SAO_company_id);
        const teacherIds = allFCTs.map(f => f.SAO_teacher_id);
        const studentIds = allFCTs.map(f => f.SAO_student_id);

        const allIds = [...new Set([
            ...companyIds,
            ...teacherIds,
            ...studentIds
        ])];

        // Cargar usuarios de una sola vez
        const users = await userManagerModel.find({
            SAO_id: { $in: allIds }
        }).lean();

        const mapUsers = {};
        users.forEach(u => mapUsers[u.SAO_id] = u);

        // Función interna para mapear un FCT individual
        const mapOne = (f) => ({
            ...f,

            // Empresa
            SAO_company_id_FCTM: mapUsers[f.SAO_company_id]?._id || null,
            SAO_company_name: mapUsers[f.SAO_company_id]?.SAO_name || "Desconocida",
            SAO_company_email: mapUsers[f.SAO_company_id]?.SAO_email || "",
            SAO_company_phone: mapUsers[f.SAO_company_id]?.SAO_phone || "",

            // Alumno
            SAO_student_id_FCTM: mapUsers[f.SAO_student_id]?._id || null,
            SAO_student_name: mapUsers[f.SAO_student_id]?.SAO_name || "Desconocido",
            SAO_student_email: mapUsers[f.SAO_student_id]?.SAO_email || "",
            SAO_student_phone: mapUsers[f.SAO_student_id]?.SAO_phone || "",

            // Profesor
            SAO_teacher_id_FCTM: mapUsers[f.SAO_teacher_id]?._id || null,
            SAO_teacher_name: mapUsers[f.SAO_teacher_id]?.SAO_name || "Desconocido",
            SAO_teacher_email: mapUsers[f.SAO_teacher_id]?.SAO_email || "",
        });

        // Crear nuevo objeto con populate
        return {
            newFCT: FCTInfo.newFCT.map(mapOne),
            updatedFCT: FCTInfo.updatedFCT.map(mapOne)
        };

    } catch (error) {
        console.error("Error en populateFCTInfo:", error);
        return FCTInfo;
    }
};
