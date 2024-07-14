import React, { useEffect, useRef } from "react";
import * as d3_sanky from "d3-sankey";
import * as d3 from "d3"

const data = {
    nodes: [
        {name:"Bight of Benin",category:"Bight"},{name:"Brazil",category:"Brazil"},{name:"Bight of Biafra and Gulf of Guinea islands",category:"Bight"},{name:"Gold Coast",category:"Gold"},{name:"Others Dep.",category:"Others"},{name:"Senegambia and offshore Atlantic",category:"Senegambia"},{name:"Sierra Leone e Windward Coast",category:"Sierra"},{name:"Southeast Africa and Indian Ocean islands",category:"Southeast"},{name:"West Central Africa and St. Helena",category:"West"},{name:"Caribbean",category:"Caribbean"},{name:"Mainland North America",category:"Mainland"},{name:"Others Arr",category:"Others"},{name:"Spanish American Mainland",category:"Spanish"}
    ],

    links: [
        {target:"Brazil",source:"Bight of Benin",value:733769},{target:"Brazil",source:"Bight of Biafra and Gulf of Guinea islands",value:98256},{target:"Brazil",source:"Gold Coast",value:40507},{target:"Brazil",source:"Others Dep.",value:18627},{target:"Brazil",source:"Senegambia and offshore Atlantic",value:86001},{target:"Brazil",source:"Sierra Leone e Windward Coast",value:5409},{target:"Brazil",source:"Southeast Africa and Indian Ocean islands",value:232940},{target:"Brazil",source:"West Central Africa and St. Helena",value:1818611},{target:"Caribbean",source:"Bight of Benin",value:494753},{target:"Caribbean",source:"Bight of Biafra and Gulf of Guinea islands",value:678927},{target:"Caribbean",source:"Gold Coast",value:517280},{target:"Caribbean",source:"Others Dep.",value:192389},{target:"Caribbean",source:"Senegambia and offshore Atlantic",value:144125},{target:"Caribbean",source:"Sierra Leone e Windward Coast",value:284412},{target:"Caribbean",source:"Southeast Africa and Indian Ocean islands",value:57138},{target:"Caribbean",source:"West Central Africa and St. Helena",value:793963},{target:"Mainland North America",source:"Bight of Benin",value:7153},{target:"Mainland North America",source:"Bight of Biafra and Gulf of Guinea islands",value:39389},{target:"Mainland North America",source:"Gold Coast",value:26918},{target:"Mainland North America",source:"Others Dep.",value:12532},{target:"Mainland North America",source:"Senegambia and offshore Atlantic",value:49118}
    ]
};

const width = 700;
const height = 500;

export const Sankey = () => {
    const svgRef = useRef(null);
    const nodeRef = useRef(null);
    const linksRef = useRef(null);

    useEffect(() => {
        const svgCurrent = svgRef.current
        const svgNodesCurrent = nodeRef.current
        const svgLinksCurrent = linksRef

        if (svgCurrent && svgNodesCurrent && svgLinksCurrent) {
            const svgD3 = d3.select(svgCurrent)
                .attr('width', width)
                .attr('height', height)

            const sankeyStructureDataNodesLinks =  d3_sanky.sankey()
                .nodeWidth(20)
                .nodePadding(10)
                .extent([1, 1], [width - 1, height - 6]);

            const { nodes, links } = sankeyStructureDataNodesLinks(data);

            console.log("------------------------- > ", nodes)
            
            d3.select(svgNodesCurrent)
                .selectAll('rect')
                .data(nodes)
                .enter().append('rect')
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('height', d => d.y1 - d.y0)
                .attr('width', sankeyStructureDataNodesLinks.nodeWidth())
                .attr('fill', 'steelblue')
            
            d3.select(svgLinksCurrent)
            .attr('fill', 'none')
            .selectAll('path')
            .data(links)
            .enter().append('path')
            .attr('d', d3_sanky.sankeyLinkHorizontal())
            .attr('stroke', 'gray')
            .attr('stroke-width', d => Math.max(1, d.width));
        }
    }, [svgRef, nodeRef, linksRef]);

    return (
        <div>
            <svg ref={svgRef}>
                <g ref={nodeRef}></g>
                <g ref={linksRef}></g>
            </svg>
        </div>
    )
}


export default Sankey