import React from "react";
import { Button, Container, Segment, Grid, Header } from "semantic-ui-react";
import {
  Table,
  Message,
  Label,
  Icon,
  Dimmer,
  Loader,
  Form,
  Transition,
  Image,
  Confirm,
  Input,
  Select,
  Divider,
  Popup,
  Statistic
} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import { connect } from "react-redux";

import Countdown, { zeroPad, calcTimeDelta, formatTimeDelta } from 'react-countdown';
import { Component } from 'react'
import { exit } from "process";

class Home extends Component {
  state = {
    task: '', duration: 60,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
    todos: this.props.todos
  }


  componentDidUpdate() {
    this.props.todos.map(function (item, i) {

      let index = this.props.todos.findIndex(el => el.task === item.task)

      this.props.todos[index].tick = (ref) => {
        let index = this.props.todos.findIndex(el => el.task === item.task)
        this.props.todos[index].total[new Date().toISOString().substr(0, 10)] = ref.total


        this.props.dispatch({
          type: "UPDATE",
          key: item.task,
          payload: {
            total: this.props.todos[index].total
          }
        })

      }
    }.bind(this))

  }
  handleChange = (e, input) => {
    if (input.type === "checkbox") {
      this.setState({ [input.name]: input.checked })
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  handleSubmit = () => {
    const { task, duration } = this.state

    if (task.length === 0 || parseInt(duration) === 0) {
      alert('fill all fields')
      return
    }

    let days = {
      mon: this.state.mon,
      tue: this.state.tue,
      wed: this.state.wed,
      thu: this.state.thu,
      fri: this.state.fri,
      sat: this.state.sat,
      sun: this.state.sun,
    }

    if (!(
      this.state.mon ||
      this.state.tue ||
      this.state.wed ||
      this.state.thu ||
      this.state.fri ||
      this.state.sat ||
      this.state.sun
    )) {
      days[new Date().toISOString().substr(0, 10)] = true
    }


    this.props.dispatch({
      type: "ADD",
      key: task,
      payload: {
        task,
        duration: duration * 60 * 1000,
        isStarted: false,
        total: {},
        clockApi: null,
        days
      }


    })



    this.setState({
      ...this.state,
      task: '', duration: 60,

      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,

      todos: [
        ...this.state.todos,
        {
          task,
          duration: duration * 60 * 1000,
          isStarted: false,

          total: {},
          clockApi: null,
          days
        }
      ]
    });


  }

  deleteRecord = (item) => {

    this.props.dispatch({
      type: "DELETE",
      key: item.task,
    })

  }


  toggleCountDownStatus = (item) => {
    let index = this.props.todos.findIndex(el => el.task === item.task)
    if (this.props.todos[index].isStarted) {
      this.props.dispatch({
        type: "UPDATE",
        key: item.task,
        payload: {
          isStarted: false
        }
      })
      // this.state.todos[index].isStarted = false
      this.props.todos[index].clockApi.pause()
    } else {
      this.props.dispatch({
        type: "UPDATE",
        key: item.task,
        payload: {
          isStarted: true
        }

      })
      // this.state.todos[index].isStarted = true
      this.props.todos[index].clockApi.start()
    }

    this.setState({
      ...this.state,
      todos: this.props.todos
    })
  }

  render() {
    return (
      <React.Fragment>

        <Container style={{ marginTop: 60 }}>
          <Divider horizontal>
            <Header as="h2">Tasks</Header></Divider>
          {this.props.todos.filter(todaysTask).length != 0 ? (
            <Table compact basic='very'>

              <Table.Body>
                {/* We get an Object for todos so we have to map and pull out each "element" */}

                {this.props.todos.filter(todaysTask).map(function (item, i) {

                  let startPoint = (item.total[new Date().toISOString().substr(0, 10)] != undefined) ? item.total[new Date().toISOString().substr(0, 10)] : parseInt(item.duration);
                  return (
                    <Table.Row key={i}>
                      <Table.Cell width={8}>
                        {item.task}
                      </Table.Cell>
                      <Table.Cell width={2}>
                        {taskStutus(item)}
                      </Table.Cell>
                      <Table.Cell width={2} onClick={() => this.toggleCountDownStatus(item)}>

                        <Countdown
                          date={Date.now() + startPoint}
                          ref={item.ref}
                          autoStart={false}
                          controlled={false}
                          onTick={item.tick}
                          overtime={true}
                          renderer={function ({ total, hours, minutes, seconds, api }) {
                            item.clockApi = api
                            let sign = (parseInt(total) > 0) ? "" : "-";
                            return sign + zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds)
                          }.bind(this)}
                        />
                      </Table.Cell>
                      <Table.Cell width={4}>
                        <Button icon='delete' content='Cancel' color="black" basic size='mini' onClick={() => this.deleteRecord(item)} />
                        <Button icon={item.isStarted ? 'pause' : 'play'} content={item.isStarted ? 'Stop' : 'Go'} color='teal' basic size='mini' onClick={() => this.toggleCountDownStatus(item)} />
                      </Table.Cell>
                    </Table.Row>
                  )
                }.bind(this))
                }
                {/* End of Object.keys */}
              </Table.Body>
            </Table>
          ) : (
            <Message positive>
              <Message.Header>No Todos</Message.Header>
              <p>
                Looks like your all <b>caught up!</b>
              </p>
            </Message>
          )}
          <Form>

            <Grid>
              <Grid.Row>
                <Grid.Column textAlign="center">
                  <Divider horizontal>Statistics</Divider>
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="tasks" />
                      <span style={{ padding: 8 }}>
                        {this.props.todos.filter(todaysTask).length}
                      </span>
                    </Statistic.Value>
                    <Statistic.Label>Total Todos</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="tasks" color="orange" />
                      <span style={{ padding: 8, color: '#f2711c' }}>
                        {this.props.todos.filter(todaysTask).filter((el) => { return !(parseInt(el.total[new Date().toISOString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toISOString().substr(0, 10)]) <= 0)) })
                          .length}
                      </span>
                    </Statistic.Value>
                    <Statistic.Label style={{ color: '#f2711c' }}>Pending</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="tasks" color="teal" />
                      <span style={{ padding: 8, color: '#009c95' }}>
                        {this.props.todos.filter(todaysTask).filter((el) => { return parseInt(el.total[new Date().toISOString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toISOString().substr(0, 10)]) <= 0) })
                          .length}
                      </span>
                    </Statistic.Value>
                    <Statistic.Label style={{ color: '#009c95' }}>In Progress</Statistic.Label>
                  </Statistic>

                  <Statistic>
                    <Statistic.Value>
                      <Icon name="tasks" style={{ color: 'gray' }} />
                      <span style={{ padding: 8, color: "gray" }}>
                        {this.props.todos.filter(todaysTask).filter((el) => { return parseInt(el.total[new Date().toISOString().substr(0, 10)]) <= 0 })
                          .length}
                      </span>
                    </Statistic.Value>
                    <Statistic.Label style={{ color: "gray" }}>
                      Completed
                    </Statistic.Label>
                  </Statistic>
                </Grid.Column>
              </Grid.Row>

            </Grid>
          </Form>
          {/* End add a form at the end of the table */}
        </Container>

        <Container>
          <Segment>
            <Header>New Task</Header>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group >
                <Form.Input
                  width={2}
                  style={{ marginBottom: 4 }}
                  type='number'
                  placeholder='Duration'
                  name='duration'
                  value={this.state.duration}
                  onChange={this.handleChange}
                />
                <Form.Input
                  width={14}
                  style={{ marginBottom: 4 }}
                  placeholder='Task'
                  name='task'
                  value={this.state.task}
                  onChange={this.handleChange}
                />

              </Form.Group>
              <Form.Group inline>
                <Button content='Just Today' color="teal" basic size='mini' onClick={(e) => {
                  e.preventDefault()
                  this.setState({
                    ...this.state,
                    mon: false,
                    tue: false,
                    wed: false,
                    thu: false,
                    fri: false,
                    sat: false,
                    sun: false
                  })
                }} />
                <Button content='All Days' color="teal" basic size='mini' onClick={(e) => {
                  e.preventDefault()
                  this.setState({
                    ...this.state,
                    mon: true,
                    tue: true,
                    wed: true,
                    thu: true,
                    fri: true,
                    sat: true,
                    sun: true
                  })
                }} />
                <Button content='Odd Days' color="teal" basic size='mini' onClick={(e) => {
                  e.preventDefault()
                  this.setState({
                    ...this.state,
                    mon: false,
                    tue: true,
                    wed: false,
                    thu: true,
                    fri: false,
                    sat: false,
                    sun: true
                  })
                }} />

                <Button content='Even Days' color="teal" basic size='mini' onClick={(e) => {
                  e.preventDefault()
                  this.setState({
                    ...this.state,
                    mon: true,
                    tue: false,
                    wed: true,
                    thu: false,
                    fri: false,
                    sat: true,
                    sun: false
                  })

                }} />
              </Form.Group>
              <Form.Group inline>
                <label>Days</label>
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.mon} onChange={this.handleChange} label='Monday' name='mon' />
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.tue} onChange={this.handleChange} label='Tuesday' name='tue' />
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.wed} onChange={this.handleChange} label='Wednesday' name='wed' />
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.thu} onChange={this.handleChange} label='Thursday' name='thu' />
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.fri} onChange={this.handleChange} label='Friday' name='fri' />
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.sat} onChange={this.handleChange} label='Saturday' name='sat' />
                <Form.Checkbox style={{ marginBottom: 4 }} checked={this.state.sun} onChange={this.handleChange} label='Sunday' name='sun' />
              </Form.Group>
              <Form.Group>
                <Form.Button width={2} content='Submit' />
              </Form.Group>
            </Form>
          </Segment>

        </Container>
      </React.Fragment>
    )
  }
}
const taskStutus = (el) => {
  if (parseInt(el.total[new Date().toISOString().substr(0, 10)]) <= 0)
    return <Button basic color='gray' content='Completed' size='mini' />
  else if (parseInt(el.total[new Date().toISOString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toISOString().substr(0, 10)]) <= 0))
    return <Button basic color='teal' content='In Progress' size='mini' />
  else if (!(parseInt(el.total[new Date().toISOString().substr(0, 10)]) < parseInt(el.duration) && !(parseInt(el.total[new Date().toISOString().substr(0, 10)]) <= 0)))
    return <Button basic color='orange' content='Pending' size='mini' />


  return <Button basic color='gray' content='Undefined' />
}
const todaysTask = (el) => {
  let day = ''
  switch (new Date().getDay()) {
    case 1:
      day = 'mon'
      break;

    case 2:
      day = 'tue'
      break;

    case 3:
      day = 'wed'
      break;

    case 4:
      day = 'thu'
      break;

    case 5:
      day = 'fri'
      break;

    case 6:
      day = 'sat'
      break;

  }
  if (el === undefined || el === null)
    return false
  return el.days[day] === true || el.days[new Date().toISOString().substr(0, 10)] === true
}

const mapStateToProps = state => ({
  todos: state.app.todos,
});

const ConnectedApp = connect(mapStateToProps)(Home);
export default ConnectedApp
