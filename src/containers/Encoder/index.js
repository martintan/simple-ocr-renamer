import React, { useState, useEffect } from 'react'
import css from './style.module.scss'
import { connect } from 'react-redux'
import { connectSocketClient, requestAccessFile, fetchFiles } from 'store/actions'
import CurrentTime from 'components/CurrentTime'
import LiveTree from './LiveTree'
import Viewer from './Viewer'
import TrackingNo from './TrackingNo'

const { ipcRenderer } = window.require('electron')

let counter = 0

function Encoder(props) {
  // store state
  const { user, files, accessedFiles } = props
  // network actions
  const { connectSocketClient, requestAccessFile, fetchFiles } = props
  const [ accessedFile, setAccessedFile ] = useState(null)

  useEffect(() => {
    connectSocketClient()
    fetchFiles('D:\\Files\\scan_test_1')
  }, [])

  function handleTreeSelect(selectedKeys, node) {
    // socket.emit('scanStop')
    requestAccessFile(node.props.path, user)
  }

  function handleTest() {
    // socket.on('scannedFile', (buffer) => {
      // BarcodeScanner.scanQuagga(Buffer.from(buffer).toString('base64'), (current, total, status) => {
      //   console.log(current, total, status)
      // })
      // .then(console.log)
    // })
  }

  // const myAccessedFiles = accessedFiles.filter(f => f.user.username === user.username)
  // if (myAccessedFiles.length > 0) {
  //   accessedFile = myAccessedFiles[0].title
  // }

  useEffect(() => {
    if (files.length && counter <= 0) {
      const availableFiles = files.filter(f => 
        // remove files currently being accessed (except ones I'm already accessing)
        // from the vacant list of files
        !accessedFiles
        .filter(af => af.user.username !== user.username)
        .map(af => af.title)
        .includes(f.path)
      )
      const fileToAccess = availableFiles[0].path
      setAccessedFile(fileToAccess)
      // don't request access if already accessing it in server
      if (accessedFiles.filter(af => af.title === fileToAccess && af.user.username === user.username).length <= 0)
        requestAccessFile(fileToAccess, user)
      // only run this code once (when files data is loaded)
      counter++
    }
  }, [files])

  useEffect(() => {
    if (accessedFile) {
      ipcRenderer.send('scan-barcode', accessedFile)
      ipcRenderer.on('scan-barcode-finish', (event, data) => {
        console.log('scan-barcode-finish:', data)
      })
    }
  }, [accessedFile])

  return (
    <div className={css.container}>
      <div className={css.tree_container}>
        <strong>{user.username}</strong>
        <button onClick={handleTest}>Test Server</button>
        <CurrentTime />
        <LiveTree
          onSelect={handleTreeSelect}
          accessedFiles={accessedFiles}
          treeData={files}
        />
      </div>
      <div className={css.viewer_container}>
        <Viewer fileName={accessedFile} />
      </div>
      <div className={css.encoding_container}>
        <TrackingNo accessedFile={accessedFile} />
      </div>
      <div className={css.api_container}>

      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.user,
  socket: state.socket,
  accessedFiles: state.accessedFiles,
  files: state.files,
})

const mapDispatchToProps = (dispatch) => ({
  connectSocketClient: () => dispatch(connectSocketClient()),
  requestAccessFile: (path, user) => dispatch(requestAccessFile(path, user)),
  fetchFiles: (path) => dispatch(fetchFiles(path)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Encoder)
