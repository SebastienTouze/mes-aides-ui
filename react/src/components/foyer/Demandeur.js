import React from 'react'
import { withRouter } from 'react-router-dom'
import { Button, Form, DatePicker } from 'antd'
import { connect } from 'react-redux'

import { modifyDateOfBirth } from '../../../../app/redux/actions'

const Demandeur = (props) => {

  function handleSubmit(e) {
    e.preventDefault()
    props.history.push('/foyer/enfants')
  }

  function handleChange(date, dateString) {
    props.modifyDateOfBirth('demandeur', dateString)
  }

	return (
    <div>
      <h1>Demandeur</h1>
      <Form layout="vertical" onSubmit={ handleSubmit }>
        <Form.Item label="Date de naissance">
          <DatePicker format="DD/MM/YYYY" onChange={ handleChange } />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Valider
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

function mapStateToProps(state) {

  return {

  }
}

function mapDispatchToProps (dispatch) {

  return {
    modifyDateOfBirth: (id, date) => dispatch(modifyDateOfBirth(id, date))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Demandeur))
