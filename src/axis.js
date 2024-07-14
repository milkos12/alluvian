
import * as d3 from 'd3';
import { sankey as d3_sankey } from 'd3-sankey'

import { useEffect, useRef } from 'react';

export const Alluvian = () => {

    const y_axistRef = useRef(null);
    const svgRef = useRef(null);




    useEffect(() => {
        //Basics thins in graph 
        //dimentions 
        const [
            width,
            height,
            marginTop,
            marginRigth,
            marginBottom,
            marginLeft ] = [640, 400, 20, 20, 30, 40];
        if (svgRef.current) {

            //postion in x and y 
            //scale x
            const x = d3.scaleUtc()
                .domain([new Date("2023-01-01"), new Date("2024-01-01")])
                .range([marginLeft, width - marginRigth]);

            //scale y
            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height - marginBottom, marginTop])

            // svg base
            const svg = d3.select(svgRef.current)
                .attr("width", width + marginLeft)
                .attr("height", height + marginTop)
                


            //add the axis x
            d3.select(y_axistRef.current)
                .attr("transform", `translate(${marginLeft}, 0)`)
                .call(d3.axisLeft(y))
            
            //add the axis y 
            svg.append("g")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x))
        }
    }, [y_axistRef])


    return (
        <div>
            <svg ref={svgRef}>
                <g ref={y_axistRef}></g>
            </svg>
        </div>
    )
}

export default Alluvian;