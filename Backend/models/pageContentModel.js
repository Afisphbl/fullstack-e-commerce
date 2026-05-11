'use strict';

const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: [true, 'Page identifier is required'],
      unique: true,
      enum: {
        values: ['home', 'about', 'contact', 'faq'],
        message: '{VALUE} is not a valid page',
      },
    },
    sections: [
      {
        key: {
          type: String,
          required: [true, 'Section key is required'],
          trim: true,
        },
        title: {
          type: String,
          trim: true,
          default: '',
        },
        subtitle: {
          type: String,
          trim: true,
          default: '',
        },
        description: {
          type: String,
          trim: true,
          default: '',
        },
        image: {
          type: String,
          default: '',
        },
        buttonText: {
          type: String,
          trim: true,
          default: '',
        },
        buttonLink: {
          type: String,
          trim: true,
          default: '',
        },
        items: [
          {
            icon: {
              type: String,
              trim: true,
              default: '',
            },
            title: {
              type: String,
              trim: true,
              default: '',
            },
            description: {
              type: String,
              trim: true,
              default: '',
            },
            value: {
              type: String,
              trim: true,
              default: '',
            },
            label: {
              type: String,
              trim: true,
              default: '',
            },
            order: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
pageContentSchema.index({ page: 1 });

// Method to get section by key
pageContentSchema.methods.getSection = function (key) {
  return this.sections.find((section) => section.key === key);
};

// Method to update section
pageContentSchema.methods.updateSection = function (key, data) {
  const sectionIndex = this.sections.findIndex((section) => section.key === key);
  if (sectionIndex !== -1) {
    this.sections[sectionIndex] = { ...this.sections[sectionIndex].toObject(), ...data };
  } else {
    this.sections.push({ key, ...data });
  }
  return this;
};

const PageContent = mongoose.model('PageContent', pageContentSchema);

module.exports = PageContent;
