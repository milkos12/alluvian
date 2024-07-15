
import * as d3 from 'd3';

import { useEffect, useRef, useState } from 'react';

export const Alluvian = () => {

    const y_axistRef = useRef(null);
    const y_other_axistRef = useRef(null);
    const svgRef = useRef(null);
    const link_ref = useRef(null);
    const tooltip = useRef(null);
    const tex_ref_rigth = useRef(null);
    const tex_ref_left = useRef(null);
    const [dataAlluvian, setDataAlluvian] = useState(null);
    const [columnsScalerWeigs, setColumnsScalerWeigs] = useState(null)

    const [
        width,
        height,
        marginTop,
        marginRigth,
        marginBottom,
        marginLeft] = [640, 800, 20, 20, 30, 40];


    useEffect(() => {
        let data = {
            links: [],
            nodes: []
        }
        d3.json('./links_alluvian.json').then(
            json => data.links = json
        )

        d3.json('./nodes_alluvian.json').then(
            (json) => {
                data.nodes = json
                //reload componen with data 
                setDataAlluvian(data)
            }
        )



    }, [])

    //esto saca los nodos de la derecha y de la izquierda asi como tambinen la data
    //la filtra y clasifica por columnuas derecha y izquerda tambien me va funcionar para darle las dimenciones a los links 
    useEffect(() => {
        if (dataAlluvian) {

            //con esto dtermino los values in izquierda and derecha 
            //para entender el por que de los index en la comparacion del index 
            //la documentacion lo explica bien
            //https://d3js.org/d3-force/link#link_links
            //este es el ejemplo 
            /*
            const nodes = [
                    {"id": "Alice"},
                    {"id": "Bob"},
                    {"id": "Carol"}
            ];

            const links = [
                {"source": 0, "target": 1}, // Alice → Bob
                {"source": 1, "target": 2} // Bob → Carol
            ];
            */

            const columnsFilter = dataAlluvian.nodes.map((rows, index) => {
                const filterRigth = dataAlluvian.links.filter(uniqueLink => uniqueLink.target == index)
                const filterLeft = dataAlluvian.links.filter(uniqueLink => uniqueLink.source == index)

                if (filterLeft.length > 0 || filterRigth.length > 0)
                    return {
                        left: filterLeft,
                        right: filterRigth
                    }

                return {
                    left: [],
                    right: []
                }

            })

            //setColumns(columns)


            //con esto genereo el dominio para los nodos en las columnas derecha y izquierda 
            const segmentationSumWeings = (nodes, column, node) => {
                let nodesIncules = []
                let wights = { column, node }
                //voy buscando si este node tiene uno o mas links y cuento la cantidad delinks que tiene para generarle un peso y con eso puedo sacar las escales dentro de los nodos y determinar después de donde sasele los links 
                nodes.forEach((link) => {

                    //estos ifs the left y right son por la clarsificaion que hice al principio 
                    if (column == "left") {
                        if (nodesIncules.includes(link.target)) {
                            //ese uno quiere decir que el link ya existe y le sumamaos uno que quiere decir que ahy uno mas aumenta el peso
                            wights[link.target] += 1
                        } else {
                            //aca es porque el link no existe y se agreaga y se le coloca el contador en uno 
                            nodesIncules.push(link.target)
                            wights[link.target] = 1
                        }
                    }

                    //lo mismo anterior pero la para la derecha 
                    if (column == "rigth") {
                        if (nodesIncules.includes(link.source)) {
                            //ese uno quiere decir que el link ya existe y le sumamaos uno que quiere decir que ahy uno mas aumenta el peso
                            wights[link.source] += 1
                        } else {
                            //aca es porque el link no existe y se agreaga y se le coloca el contador en uno 
                            nodesIncules.push(link.source)
                            wights[link.source] = 1
                        }
                    }
                })

                return wights
            }

            //suma todos links que hay (como las conexciones) que hay  en derecha y izquierda 
            const wightsNodes = () => {

                let allWights = []

                columnsFilter.map(nodes => {
                    //aca saco los pesasos para los los nodos de la izquierda y de la derecha (la cantidad de conecciones repetidas en el archivo links_aluvian las reptedidas representa un solo links y como estan repetidas eso lesva a dar como el peso por asi decirlo  )
                    if (nodes.left.length) {

                        const node = nodes.left[0].source
                        allWights[node] = segmentationSumWeings(nodes.left, "left", node)

                    }

                    if (nodes.right.length) {
                        const node = nodes.right[0].target
                        allWights[node] = segmentationSumWeings(nodes.right, "rigth", node)

                    }
                })

                return allWights

            }






            //colo los pesos para los nodos es decir como se va a distribuir el espacio de las barrras para la cantidad e links que tengan 
            const totalLinks = dataAlluvian.links.length
            const scalerColumns = d3.scaleLinear()
                .domain([1, totalLinks])
                .range([0, height])

            setColumnsScalerWeigs({
                weings: wightsNodes(),
                scalerColumns,
                totalLinks,
                columnsFilter
            })

        }

    }, [dataAlluvian])

    useEffect(() => {
        //Basics thins in graph 
        //dimentions 

        if (svgRef.current && columnsScalerWeigs != null) {

            // svg base
            d3.select(svgRef.current)
                .attr("width", width)
                .attr("height", height)

            //esto me ayuda a almacenar los valores y no perderlos cuando la funcion haga el return porque los necesito para mas adelante con el resto de nodos 
            let sumHigthbefore = 0;
            let sumHingth = 0;

            //cacluo del los scales(alturas o heings)
            const beforeScale = (d) => {

                let sumWitgs = 0;
                for (const [key, value] of Object.entries(d)) {
                    //aca sumo la cantidad de links que tiene cadad node. en la variable para que no sevea tan feo y tan largo dentro del if 
                    const validation = key != "column" && key != "beforeSca" && key != "node"
                    if (validation)
                        sumWitgs += value
                }

                //si sumHingth es igual a 0  quiere decir que esta en la posicion inicial por eso se devuelve 0 
                //ya si no es cero lo que se hace es que se empeiza asumar sobre los height generados por base del scale genrada anteiromete  
                if (sumHingth === 0) {
                    sumHigthbefore = columnsScalerWeigs.scalerColumns(sumWitgs)
                    sumHingth += columnsScalerWeigs.scalerColumns(sumWitgs)
                    return 0
                } else {
                    sumHigthbefore = columnsScalerWeigs.scalerColumns(sumWitgs)
                    sumHingth += columnsScalerWeigs.scalerColumns(sumWitgs)
                    return sumHingth - sumHigthbefore
                }
            }

            //sumo todos los pesos de cada link que tiene cada nodo
            //y aprovecho las referencias en memoría para guarda un array los links para que me quede facil usarlos mas adelan y que no queden en el mismo nivel de los otros datos
            const sumValues = (d) => {
                let linksArray = []
                let sumWitgs = 0;
                for (const [key, value] of Object.entries(d)) {
                    const validation = key != "column" && key != "beforeSca" && key != "node"
                    if (validation) {
                        sumWitgs += value
                        let link = {}
                        link[key] = value
                        linksArray.push(link)
                    }

                }

                d['linksArray'] = linksArray
                return sumWitgs
            }



            //extraer los datos para la columna de la izquierda 
            let columnLeft = []
            columnsScalerWeigs.weings.forEach((weigh, index) => {

                if (weigh.column == "left")
                    columnLeft.push(weigh)
            })

            //aca cree una funcion para genera el un scaler pero basado en la altura eso econ el fin de poder distriburi el espacio para los links  
            const scalerLinkns = (curentScaleY, sumWingLinks) => {
                return d3.scaleLinear()
                    .domain([0, sumWingLinks])
                    .range([0, curentScaleY])
            }

            //aca uso nuevamente las referencias en memoria para guardar informacion que me ayuda a ubicar los links 

            const saveCorrdenatesYEachNode = (d) => {

                const scaler = scalerLinkns(d.curentScaleY, d.sumLinks, d.beforeSca)

                d['scalerLinks'] = scaler
                //colcoar valor de expacio disponoblibe para poder ubicar los links 
                d['usedSpace'] = 0


            }

            //cuando se recarga no se borran los elementos dentro del svg y toca removerlos 
            d3.select(y_axistRef.current)
                .selectAll('*').remove()

            //la escala hace refercian a la altura se colocan fuera por que necesito ir almacinadolar para usarlas en distintas partes del bloque 
            let curentScaleY = 0;
            let beforeSca = 0;
            let sumWingLinks = 0;
            d3.select(y_axistRef.current)
                .selectAll('g')
                .data(columnLeft)
                .enter().append('rect')
                .attr('x', 30)
                .attr('y', (d) => {
                    beforeSca = beforeScale(d)

                    d['beforeSca'] = beforeSca


                    return beforeSca
                })
                .attr('width', 15)
                .attr('height', (d) => {
                    //aca dtermino la alturoa del nodo y guardo la informacion y tambie uso las referncia en memoria para gardar curentScaleY y sumWingLinks
                    //tabine sumo todos los links para determinar su altura 
                    sumWingLinks = sumValues(d)
                    curentScaleY = columnsScalerWeigs.scalerColumns(sumWingLinks)
                    d['curentScaleY'] = curentScaleY
                    d['sumLinks'] = sumWingLinks
                    return curentScaleY

                })
                .attr('fill', (d) => '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                .each((d) => {
                    // esta funcion me va generar por decirlo las subdivision dentro de cada node para saber que tangrandes y como debe ir los links
                    saveCorrdenatesYEachNode(d)

                })
                .attr("node", (d) => d.node)








            sumHigthbefore = 0;
            sumHingth = 0;

            let columnRigth = []
            columnsScalerWeigs.weings.forEach((weigh) => {
                if (weigh.column == "rigth")
                    columnRigth.push(weigh)
            })


            //aca en este bloque de codigoo hago excatamente lo mismo pero con la barra de la izquierda
            curentScaleY = 0;
            beforeSca = 0;
            sumWingLinks = 0;

            d3.selectAll(y_other_axistRef.current).selectAll('*').remove()
            d3.select(y_other_axistRef.current)
                .selectAll('g')
                .data(columnRigth)
                .enter().append('rect')
                .attr('x', width - 15)
                .attr('y', (d) => {
                    beforeSca = beforeScale(d)

                    d['beforeSca'] = beforeSca


                    return beforeSca
                })
                .attr('width', 15)
                .attr('height', (d) => {
                    sumWingLinks = sumValues(d)
                    curentScaleY = columnsScalerWeigs.scalerColumns(sumWingLinks)
                    d['curentScaleY'] = curentScaleY
                    d['sumLinks'] = sumWingLinks
                    return curentScaleY

                })
                .attr('fill', (d) => "hsl(" + Math.random() * 360 + ",100%,50%)")
                .each((d) => {

                    saveCorrdenatesYEachNode(d)

                })
                .attr("node", (d) => d.node)

            //testear las posicione de los links ------------------------------------

            const currentNode = columnLeft[0]





            //------------------------------------

            const link = d3.link(d3.curveBumpX)


            //buscar y devolber la posicio para el link desde la izquierda 
            const enterToRaightColumn = (valorFromLeft, useSpace) => {

                let postionForLink = 0
                columnRigth.forEach((node) => {
                    if (node.node == valorFromLeft) {

                        //aca lo que hago es entrar ala posicoin donde empiesa el nodo y le sumo el espacio usado esto me da el espacio que pueduo usar 
                        //este valor meda desde donde va ir el link 
                        postionForLink = node.beforeSca + node.usedSpace
                        //actuzlizo el espacio usado 
                        node.usedSpace = node.usedSpace + useSpace


                    }
                })

                return postionForLink

            }
            //256 posicion de x mas el ancho de link divido en dos 7.5 

            const generateLinkPath = (startdY, scaler, node) => {
                //trare la posicion del link para la izquierda 
                const positionTarget = enterToRaightColumn(node, scaler)

                // positionTarget + (scaler / 2) esto espor que la posiscion se centra y la mitat queda antes de iniciar el nodeo y la otra midad si queda dentro del nodo por eso toca dibider el cansho y sumarselo para que no quede la mitad inicia fuera del nodo 
                const linkPath = link({ source: [40, startdY], target: [width - 15, positionTarget + (scaler / 2)] });
                return linkPath
            }


            let sumHeigLinks = 0;
            d3.select(link_ref.current).selectAll('*').remove()
            // generacion de los links voy node por node en de la izquierda y basado en esta izquierda voy a generar las coodrdenas en la parte derecha en target
            columnLeft.forEach((columnLeftNodes) => {

                d3.select(link_ref.current)
                    .selectAll('g')
                    .data(columnLeftNodes.linksArray).join('path')
                    .attr('d', (d) => {
                        //el array que había creado de los links que había creado anteriormente
                        const parseArrayLinks = Object.entries(d)

                        const escaler = currentNode.scalerLinks(parseArrayLinks[0][1])

                        sumHeigLinks += escaler
                        //esto es por que el link posciciona su centro al inicion lo que hace que la otra mitad incial qude atras ocupando esapcio que no le corresponde 
                        const startdY = (sumHeigLinks - escaler) + (escaler / 2)
                        return generateLinkPath(startdY, escaler, parseArrayLinks[0][0])
                    })
                    .attr('stroke-width', (d) => {
                        const parseArrayLinks = Object.entries(d)
                        //con el scaler determino el andho del link 
                        const escaler = currentNode.scalerLinks(parseArrayLinks[0][1])
                        return escaler
                    })
                    //aditional information 
                    .attr('data-node-origin', (d) => columnLeftNodes.node)
                    .attr('data-node-destination', (d) => {
                        const parseArrayLinks = Object.entries(d)
                        return parseArrayLinks[0][0]
                    })
                    .attr('stroke', (d) => "hsl(" + Math.random() * 360 + ",100%,50%)")
                    .attr('fill', 'none')
                    .attr('opacity', '0.5')
                    .on('mouseover', function (envent) {
                        d3.select(this)
                            .attr('stroke', 'red')

                        //info for tooltip
                        const dataInfoLink = () => {

                            const filterTest = d3.select(this).filter((d) => d)
                            const nodeOrigin = filterTest._groups[0][0].attributes["data-node-origin"].value
                            const nodeDestination = filterTest._groups[0][0].attributes["data-node-destination"].value
                            const texToolTop = `Node origin: ${nodeOrigin} --> Destination: ${nodeDestination}`;
                            return texToolTop
                        }



                        d3.select(tooltip.current).selectAll('*').remove()
                        d3.select(tooltip.current)
                            .join()
                            .append('p')
                            .text(dataInfoLink())

                    })
                    .on('mousemove', function (event) {

                        d3.select(tooltip.current)
                            .style('top', `${event.clientY - 30}px`)
                            .style('left', `${event.clientX + 20}px`)
                            .style('display', 'block')
                            .style('opacity', '0.9')
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                            .attr('stroke', "hsl(" + Math.random() * 360 + ",100%,50%)")

                        d3.select(tooltip.current)
                            .style('display', 'none')

                    })

            })


            if (columnLeft.length) {
                //put the textleables 


                const generteLeables = (columnData, postionX, ref) => {

                    let currentScaleY = 0;
                    d3.select(ref.current)
                        .selectAll('text')
                        .data(columnData)
                        .enter()
                        .append('text')
                        .attr('fill', 'red')
                        .attr('x', postionX)
                        .attr('y', (d) => {
                            const hiehtNode = d.curentScaleY

                            //positionatnion  for leables base in the escaler of nodes 
                            //divide y suma entre dos para no dejar el texto en el principio sino en el centro 
                            let positonY = 0;
                            if (currentScaleY > 0) {
                                positonY = currentScaleY + (hiehtNode / 2)

                            } {
                                positonY = currentScaleY + (hiehtNode / 2)
                            }
                            currentScaleY += d.curentScaleY

                            return positonY
                        })
                        .text((d) => {
                            //d.node es el index que representa el nodo en la propiedad nodes de dataAlluvian
                            
                           
                            return `${dataAlluvian.nodes[d.node].id}`
                        })
                        .attr('stroke', 'black')

                        
                }

                
                
                console.log("............rigth...............  ", )
                generteLeables(columnRigth, 625, tex_ref_rigth)
                console.log("ñññññññ ....>>>> ", columnRigth)
                generteLeables(columnLeft, 30, tex_ref_left)
               

            }




        }
    }, [y_axistRef, columnsScalerWeigs])


    return (
        <div style={{ position: 'relative' }}>
            <svg ref={svgRef} >
                <g ref={y_axistRef}></g>
                <g ref={y_other_axistRef}></g>
                <g ref={link_ref}></g>
                <g ref={tex_ref_left}></g>
                <g ref={tex_ref_rigth}></g>
            </svg>
            <div id='tooltip' ref={tooltip} style={{ height: 'auto', width: 'auto', background: "white", position: 'absolute', top: 20, left: 200, borderRadius: 15, padding: 10, display: 'none' }}>

            </div>

        </div>
    )
}

export default Alluvian;