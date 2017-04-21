import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Messages = new Mongo.Collection('Messages');

if (Meteor.isServer) {
  Meteor.publish('messages', function() {
    var yesterday = new Date().setDate(new Date().getDate() - 1);
    return this.userId ? Messages.find({}) : [];
  });
}

Meteor.methods({
  'messages.insert'(text) {
    check(text, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Messages.insert({
      message: text,
      createdAt: new Date(),
      owner: this.userId,
      author: Meteor.users.findOne(this.userId).username,
    });
  }
});
