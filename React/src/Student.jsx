import React from 'react'

function Student(props) {
  return (
    <div>
<h2> Name:{props.name}</h2>
<p> Course:{props.course}</p>
<p> Marks:{props.marks}</p>
    </div>
  )
}
//rfce
export default Student