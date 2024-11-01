const { Book, User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
        if (context.user) {
            return await User.findOne({ _id: context.user._id }).populate('savedBooks');
        }
        throw new AuthenticationError ('Log-in required!');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthenticationError('Incorrect credentials!');
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
            throw new AuthenticationError('Incorrect credentials');
          }
    
          const token = signToken(user);
          return { token, user };
        },
    
        addUser: async (parent, { username, email, password }) => {
          const user = await User.create({ username, email, password });
          const token = signToken(user);
          return { token, user };
        },
    
        saveBook: async (parent, { input }, context) => {
          if (context.user) {
            return await User.findByIdAndUpdate(
              context.user._id,
              { $addToSet: { savedBooks: input } },
              { new: true, runValidators: true }
            ).populate('savedBooks');
          }
          throw new AuthenticationError('You need to be logged in!');
        },
    
        removeBook: async (parent, { bookId }, context) => {
          if (context.user) {
            return await User.findByIdAndUpdate(
              context.user._id,
              { $pull: { savedBooks: { _id: bookId } } },
              { new: true }
            ).populate('savedBooks');
          }
          throw new AuthenticationError('You need to be logged in!');
        },
      },
    };
    

module.exports = resolvers;