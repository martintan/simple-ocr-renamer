import React, { useState, useEffect } from 'react'
import { Document, Page } from 'react-pdf/dist/entry.webpack'
import css from './style.module.scss'

function Viewer({ fileName }) {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)

  function onDocumentLoad({ numPages }) {
    setNumPages(numPages)
  }

  return (
    <Document
      file={fileName ? `${process.env.REACT_APP_SERVER_URL}/filetree/open?path=${fileName}` : null}
      onLoadSuccess={onDocumentLoad}
    >
      <Page pageNumber={pageNumber} scale={3} />
    </Document>
  )
}

export default Viewer