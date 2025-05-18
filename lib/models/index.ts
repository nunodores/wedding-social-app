import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

// WeddingEvent Model
export class WeddingEvent extends Model {
  public id!: string;
  public name!: string;
  public slug!: string;
  public hashedPassword!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WeddingEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'wedding_events',
  }
);

// Guest Model
export class Guest extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public hashedPassword!: string;
  public avatar_url?: string;
  public fcm_token?: string;
  public wedding_event_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Guest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wedding_event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: WeddingEvent,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'guests',
  }
);

// Post Model
export class Post extends Model {
  public id!: string;
  public content?: string;
  public image_url?: string;
  public video_url?: string;
  public guest_id!: string;
  public wedding_event_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Guest,
        key: 'id',
      },
    },
    wedding_event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: WeddingEvent,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'posts',
  }
);

// Story Model
export class Story extends Model {
  public id!: string;
  public media_url!: string;
  public expiresAt!: Date;
  public guest_id!: string;
  public wedding_event_id!: string;
  public readonly createdAt!: Date;
}

Story.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Guest,
        key: 'id',
      },
    },
    wedding_event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: WeddingEvent,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'stories',
  }
);

// Comment Model
export class Comment extends Model {
  public id!: string;
  public content!: string;
  public guest_id!: string;
  public post_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Guest,
        key: 'id',
      },
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'comments',
  }
);

// Like Model
export class Like extends Model {
  public id!: string;
  public guest_id!: string;
  public post_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Like.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Guest,
        key: 'id',
      },
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'likes',
    indexes: [
      {
        unique: true,
        fields: ['guest_id', 'post_id'],
      },
    ],
  }
);

export class Notification extends Model {
  public id!: string;
  public to_guest_id!: string;
  public from_guest_id!: string | null;
  public post_id!: string | null;
  public type!: 'like' | 'comment' | 'follow' | 'mention';
  public read_post!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    to_guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Guest,
        key: 'id',
      },
    },
    from_guest_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Guest,
        key: 'id',
      },
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Post,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('like', 'comment', 'follow', 'mention'),
      allowNull: false,
    },
    read_post: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
  }
);

// Define Associations
WeddingEvent.hasMany(Guest, { foreignKey: 'wedding_event_id' });
Guest.belongsTo(WeddingEvent, { foreignKey: 'wedding_event_id' });

WeddingEvent.hasMany(Post, { foreignKey: 'wedding_event_id' });
Post.belongsTo(WeddingEvent, { foreignKey: 'wedding_event_id' });

WeddingEvent.hasMany(Story, { foreignKey: 'wedding_event_id' });
Story.belongsTo(WeddingEvent, { foreignKey: 'wedding_event_id' });

Guest.hasMany(Post, { foreignKey: 'guest_id' });
Post.belongsTo(Guest, { foreignKey: 'guest_id' });

Guest.hasMany(Story, { foreignKey: 'guest_id' });
Story.belongsTo(Guest, { foreignKey: 'guest_id' });

Guest.hasMany(Comment, { foreignKey: 'guest_id' });
Comment.belongsTo(Guest, { foreignKey: 'guest_id' });

Guest.hasMany(Like, { foreignKey: 'guest_id' });
Like.belongsTo(Guest, { foreignKey: 'guest_id' });

Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

Post.hasMany(Like, { foreignKey: 'post_id' });
Like.belongsTo(Post, { foreignKey: 'post_id' });

Guest.hasMany(Notification, { foreignKey: 'to_guest_id', as: 'receivedNotifications' });
Guest.hasMany(Notification, { foreignKey: 'from_guest_id', as: 'sentNotifications' });
Notification.belongsTo(Guest, { foreignKey: 'to_guest_id', as: 'toGuest' });
Notification.belongsTo(Guest, { foreignKey: 'from_guest_id', as: 'fromGuest' });

Post.hasMany(Notification, { foreignKey: 'post_id' });
Notification.belongsTo(Post, { foreignKey: 'post_id' });

export { sequelize };