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

  componentDidMount() {
    console.log(this.props)
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

    if (task.length === 0 || parseInt(duration) === 0 || !(
      this.state.mon ||
      this.state.tue ||
      this.state.wed ||
      this.state.thu ||
      this.state.fri ||
      this.state.sat ||
      this.state.sun
    )) {
      alert('fill all fields')
      return
    }



    this.props.dispatch({
      type: "ADD",
      key: task,
      payload: {
        task,
        duration: duration * 60 * 1000,
        isStarted: false,
        ref: (ref) => {
          this.props.dispatch({
            type: "UPDATE",
            key: task,
            payload: {
              clockApi: ref
            }
          })
          // let index = this.state.todos.findIndex(el => el.task === task)
          // this.state.todos[index].clockApi = ref
          // this.setState({
          //   ...this.state,
          //   todos: this.state.todos
          // })

        },
        tick: (ref) => {
          let index = this.props.todos.findIndex(el => el.task === task)
          this.props.todos[index].total[new Date().toISOString().substr(0, 10)] = ref.total
          // this.setState({
          //   ...this.state,

          //   todos: this.state.todos
          // })

          this.props.dispatch({
            type: "UPDATE",
            key: task,
            payload: {
              total: this.props.todos[index].total
            }
          })

        },
        total: {},
        clockApi: null,
        days: {
          mon: this.state.mon,
          tue: this.state.tue,
          wed: this.state.wed,
          thu: this.state.thu,
          fri: this.state.fri,
          sat: this.state.sat,
          sun: this.state.sun,
        }
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

    });
  }


  pauseCountDown = (item) => {
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

    // this.setState({
    //   ...this.state,
    //   todos: this.state.todos
    // })
  }

  render() {
    return (
      <React.Fragment>

        <Container >
          <Divider horizontal>
            <Header as="h2">Tasks</Header></Divider>
          {this.props.todos.filter(todaysTask).length != 0 ? (
            <Table compact basic='very'>

              <Table.Body>
                {/* We get an Object for todos so we have to map and pull out each "element" */}

                {this.props.todos.filter(todaysTask).map(function (item, i) {
                  // console.log(this.props.todos)

                  let startPoint = (item.total[new Date().toISOString().substr(0, 10)] != undefined) ? item.total[new Date().toISOString().substr(0, 10)] : parseInt(item.duration);
                  return (
                    <Table.Row key={i}>
                      <Table.Cell width={12}>
                        {item.task}
                      </Table.Cell>
                      <Table.Cell onClick={() => this.pauseCountDown(item)}>

                        <Countdown date={Date.now() + startPoint}
                          ref={item.ref}
                          autoStart={false}
                          controlled={false}
                          onTick={item.tick}
                          overtime={true}
                        />
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
                      </span>
                    </Statistic.Value>
                    <Statistic.Label>Total Todos</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="tasks" />
                      <span style={{ padding: 8 }}>0</span>
                    </Statistic.Value>
                    <Statistic.Label>Pending</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>
                      <Icon name="tasks" color="teal" />
                      <span style={{ padding: 8, color: "#009c95" }}>
                        10
                      </span>
                    </Statistic.Value>
                    <Statistic.Label style={{ color: "#009c95" }}>
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

  return el.days[day] === true
}

const mapStateToProps = state => ({
  todos: state.app.todos,
});

const ConnectedApp = connect(mapStateToProps)(Home);
export default ConnectedApp