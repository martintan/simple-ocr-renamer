import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Tree, { TreeNode } from 'rc-tree'
import './rc-tree-style.scss'

function LiveTree(props) {
  const { treeData } = props
  const [selectedKeys, setSelectedKeys] = useState([])

  function handleSelect(selectedKeys, { node }) {
    setSelectedKeys(selectedKeys)
    if (props.onSelect(selectedKeys, node)) props.onSelect(selectedKeys, node)
  }

  function generateTree(data) {
    return data.map((item) => {
      if (item.children) {
        return <TreeNode key={item.id}>{generateTree(item.children)}</TreeNode>
      }
      let classNames = ''
      if (props.accessedFiles.length > 0 && props.accessedFiles.map(f => f.title).includes(item.path)) {
        props.accessedFiles.forEach(file => {
          if (file.title === item.path && file.user.username === props.user.username) {
            classNames += 'being-accessed-by-me'
          }
          else if (file.title === item.path) {
            classNames += 'being-accessed-by-other'
          }
        })
      }
      return (
        <TreeNode
          className={classNames}
          key={item.id}
          title={item.name}
          path={item.path}
        />
      )
    })
  }

  return (
    <Tree 
      onSelect={handleSelect}
      selectedKeys={selectedKeys}
    >
      {treeData ? generateTree(treeData) : null}
    </Tree>
  )
}

LiveTree.propTypes = {
  accessedFiles: PropTypes.array, // parent component (Encoder)
  treeData: PropTypes.array, // parent components (Encoder)
}

const mapStateToProps = (state) => ({
  user: state.user,
})

export default connect(mapStateToProps, null)(LiveTree)
