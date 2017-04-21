import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

import { Messages } from '../api/messages.js';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
  Meteor.subscribe('messages', () => $('.messages').scrollTop($('.messages').prop("scrollHeight")));
});

Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the tasks
    return Tasks.find({}, { sort: { createdAt: -1 } });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count();
  },
  showChat() {
    return !!Meteor.user();
  },
  messages() {
    return Messages.find({}, { sort: { createdAt: +1 } });
  }
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;

    // Insert a task into the collection
    Meteor.call('tasks.insert', text);

    // Clear form
    target.text.value = '';
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
  'submit .new-message'(event) {
    event.preventDefault();

    const target = event.target;
    const text = target.text.value;

    Meteor.call('messages.insert', text);
    target.text.value = '';

    $('.messages').scrollTop($('.messages').prop("scrollHeight"));
  },
});

Handlebars.registerHelper('formatTime', function (date) {
    return date.getHours() + (date.getMinutes() < 10 ? ":0" : ":") + date.getMinutes();
});