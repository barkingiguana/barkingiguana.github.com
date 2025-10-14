FROM ruby:3

RUN bundle config --global frozen 1

EXPOSE 4000
WORKDIR /usr/src/app

COPY Gemfile Gemfile.lock ./
RUN bundle install

CMD [ "bundle", "exec", "jekyll", "serve", "--incremental" ]
