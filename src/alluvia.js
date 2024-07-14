
import * as d3 from 'd3';

import { useEffect, useRef, useState } from 'react';


const data = [{ id: 1, value: 10, color: "#DAF7A6" }, { id: 2, value: 30, color: "#FFC300" }, { id: 3, value: 20, color: "#FF5733" }, { id: 4, value: 40, color: "#581845" }]
//rango sería la suma de los valores en este caso sería 100
const cordenatesLines = [{ x: 82, y: 438 }, { x: 264, y: 175 }]


export const Alluvian = () => {

    const y_axistRef = useRef(null);
    const y_other_axistRef = useRef(null);
    const svgRef = useRef(null);
    const link_ref = useRef(null);
    const link_ref_2 = useRef(null);
    const [dataAlluvian, setDataAlluvian] = useState(null);
    const [columnsScalerWeigs, setColumnsScalerWeigs] = useState(null)

    const [
        width,
        height,
        marginTop,
        marginRigth,
        marginBottom,
        marginLeft] = [640, 400, 20, 20, 30, 40];


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

    //esto saca los tipo de la derecha y la izquierda asi como tambine toda la datao 
    //la filtrar y clasificar tambien me va funcionar para darle las dimenciones a los links 
    useEffect(() => {
        if (dataAlluvian) {

            //determinate values in left and right 
            //para entender el por que de los index en la comparacion del index 
            //la documentacion lo explica bien 
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

            const totalWightColumn = (column) => {
                let totalWightColumn = 0;

                column.map(divitionsColumns => {
                    totalWightColumn += divitionsColumns.length

                });

                return totalWightColumn

            }

            const segmentationSumWeings = (nodes) => {
                let nodesIncules = []
                let wights = {}
                //voy buscando si este nodoe tiene uno o mas links y cuento la cantidad delinks que tiene para para generarle un peso y con eso puedo sacar las escales y ubicar exatamento los links 
                nodes.forEach((link) => {
                    if (nodesIncules.includes(link.target)) {
                        //ese uno quiere decir que el link ya existe y le sumamaos uno que quiere decir que ahy uno mas aumenta el peso
                        wights[link.target] += 1
                    } else {
                        //aca es porque el link no existe y se agreaga y se le coloca el contador en uno 
                        nodesIncules.push(link.target)
                        wights[link.target] = 1
                    }
                })

                return wights
            }

            const wightsNodes = () => {

                let allWights = []

                columnsFilter.map(nodes => {
                    //aca saco los pesaso para los lonos de la izquierda y de la derecha 
                    if (nodes.left.length) {

                        allWights[nodes.left[0].source] = segmentationSumWeings(nodes.left)
                       
                    }
                  
                    if (nodes.right.length) {

                        allWights[nodes.right[0].target] = segmentationSumWeings(nodes.right)
                      
                    }
                })

                return allWights

            }

            const scaler = (domain, range) => {
                return d3.scaleLinear()
                    .domain(domain)
                    .range(range)
            }

            
            //colo los persos para los nodos es decir como se va a distribuir el espacio de las barrras para la cantidad e links que tengan 
            const totalLinks = dataAlluvian.length
            const scalerColumns = scaler([1, totalLinks], [marginTop, height])

            setColumnsScalerWeigs({
                weings: wightsNodes(),
                scalerColumns,
                totalLinks
            })
            
        }

    }, [dataAlluvian])

    useEffect(() => {
        //Basics thins in graph 
        //dimentions 
       
        if (svgRef.current && columnsScalerWeigs != null) {

            //const values = data.map(value => value.value)
            //let sumValues = columnsScalerWeigs.totalLinks;
            //values.forEach(value => sumValues += value);

            /*const scalerX = d3.scaleLinear()
                .domain([0, sumValues])
                .range([0, height])
            */

    
                console.log("domain ......>>>>< hsl(" + Math.random() * 360 + ",100%,50%)")
            // svg base
          const svg = d3.select(svgRef.current)
                .attr("width", width)
                .attr("height", height)


            let sumWithbefore = 0;
            let sumWith = 0;
            const beforeScale = (d) => {
                
                if (sumWith === 0) {
                    sumWithbefore = scalerX(d.value)
                    sumWith += scalerX(d.value)
                    return 0
                } else {
                    sumWithbefore = scalerX(d.value)
                    sumWith += scalerX(d.value)
                    return sumWith - sumWithbefore
                }
            }
            //add the axis x

            d3.select(y_axistRef.current)
                .selectAll('g')
                .data(columnsScalerWeigs.weings)
                .enter().append('rect')
                .attr('x', 0)
                .attr('y', beforeScale)
                .attr('width', 15)
                .attr('height', (d) => scalerX(d.value))
                .attr('fill', (d) => d.color)

            sumWithbefore = 0;
            sumWith = 0;

            d3.select(y_other_axistRef.current)
                .selectAll('g')
                .data(data)
                .enter().append('rect')
                .attr('x', width - 15)
                .attr('y', beforeScale)
                .attr('width', 15)
                .attr('height', (d) => scalerX(d.value))
                .attr('fill', (d) => d.color)



            const lineGenerator = d3.line()
                //.x((d)=> d.x)
                //.y((d)=> d.y)
                .curve(d3.curveCardinalOpen)

            const corrdenates = [[100, 60], [40, 90], [200, 80], [300, 150]]
            const testCurve = [[248, 20], [marginLeft, 60], [60, 200], [200, height], [height - 350, height]]

            console.log("------>>> ", lineGenerator(testCurve))
            const example = lineGenerator(testCurve)


            const link = d3.link(d3.curveBumpX)
            console.log("--------links----->>> ", link({ source: [marginLeft + 30, marginLeft], target: [width / 2, height] }))
            //256 posicion de x mas el ancho de link divido en dos 7.5 
            const linkPath = link({ source: [15, 20], target: [width - 15, 180] });
            d3.select(link_ref.current)
                .selectAll('g')
                .data([null]).join('path')
                .attr('d', linkPath)
                .attr('stroke', 'black')
                .attr('fill', 'none')
                .attr('stroke-width', 40)




            const linkPath2 = link({ source: [15, 260], target: [width - 15, 220] });
            d3.select(link_ref_2.current)
                .selectAll('g')
                .data([null]).join('path')
                .attr('d', linkPath2)
                .attr('stroke', 'black')
                .attr('stroke-width', 40)
                .attr('fill', 'none')


            /*

            d3.select(y_axistRef.current)
            .selectAll('div')
            .data([1,2,3,4,5])
            .enter().append('div')
            .text(d=>d)*/




        }
    }, [y_axistRef])


    return (
        <div>
            <svg ref={svgRef}>
                <g ref={y_axistRef}></g>
                <g ref={y_other_axistRef}></g>
                <g ref={link_ref}></g>
                <g ref={link_ref_2}></g>

            </svg>
        </div>
    )
}

export default Alluvian;