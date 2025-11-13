// script.js — handles simulated payments, local jobs, forum, bookings, students, and chef registrations
(function(){
  // Utilities
  function $(id){ return document.getElementById(id); }
  function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function load(key, fallback){ let v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  // Initialize data stores
  let jobs = load('cs_jobs', [
    {id:'job-001', title:'Line Cook — Casual bistro (Gaborone)', level:'Line Cook', desc:'1+ year experience. Full-time.'},
    {id:'job-002', title:'Pastry Chef — Event Catering (Kenya)', level:'Chef de Partie', desc:'Seasonal contract.'}
  ]);
  save('cs_jobs', jobs);

  // Render jobs on chefs.html
  function renderJobs(){
    const list = document.getElementById('jobs-list');
    if(!list) return;
    list.innerHTML = '';
    jobs.forEach(job=>{
      const div = document.createElement('div');
      div.className = 'card job';
      div.innerHTML = `<h3>${job.title}</h3><p>Level: ${job.level} · ${job.desc}</p>
        <form class="small-form" data-jobid="${job.id}">
          <label>Applying level
            <select name="applicant_level">
              <option>Apprentice</option>
              <option>Line Cook</option>
              <option>Chef de Partie</option>
              <option>Sous Chef</option>
              <option>Head Chef</option>
              <option>Executive Chef</option>
            </select>
          </label>
          <label>Your email <input name="email" type="email" required></label>
          <button class="btn small" type="button">Apply</button>
        </form>`;
      list.appendChild(div);
      const form = div.querySelector('form');
      form.querySelector('button').addEventListener('click', ()=>{
        const level = form.querySelector('select').value;
        const email = form.querySelector('input[name=email]').value;
        if(!email){ alert('Please provide an email.'); return; }
        // simple validation: check level matches or is higher in hierarchy (not enforced in demo)
        let apps = load('cs_job_apps', []);
        apps.push({job_id: job.id, applicant_level: level, email: email, date: new Date().toISOString()});
        save('cs_job_apps', apps);
        alert('Application submitted (simulated).');
      });
    });
  }
  renderJobs();

  // Chef registration (simulated payment)
  const chefForm = $('chef-register');
  if(chefForm){
    $('chef-register-submit').addEventListener('click', ()=>{
      const name = $('chef_name').value.trim();
      const email = $('chef_email').value.trim();
      if(!name || !email){ alert('Please fill name and email.'); return; }
      // simulate payment flow
      const payMethod = document.querySelector('input[name=pay_method]:checked').value;
      // "process" payment
      const paid = true; // always succeed in demo
      const chefs = load('cs_chefs', []);
      const chef = {
        id: 'chef-' + (chefs.length+1),
        name, email,
        phone: $('chef_phone').value,
        city: $('chef_city').value,
        level: $('chef_level').value,
        specialties: $('chef_specialties').value,
        bio: $('chef_bio').value,
        paid: paid,
        payMethod: payMethod,
        created: new Date().toISOString()
      };
      chefs.push(chef);
      save('cs_chefs', chefs);
      $('chef-register-result').innerHTML = '<h3>Registration Complete</h3><p>Thank you, ' + name + '. Registration (simulated) successful.</p>';
      show($('chef-register-result'));
      chefForm.reset();
    });
  }

  // Booking
  const bookingForm = $('booking-form');
  if(bookingForm){
    $('booking-submit').addEventListener('click', ()=>{
      const name = $('client_name').value.trim();
      const email = $('client_email').value.trim();
      if(!name || !email){ alert('Please provide name and email.'); return; }
      const bookings = load('cs_bookings', []);
      bookings.push({
        id: 'bk-' + (bookings.length+1),
        client: name,
        email: email,
        phone: $('client_phone').value,
        event_type: $('event_type').value,
        event_date: $('event_date').value,
        guests: $('guests').value,
        notes: $('notes').value,
        preferred_level: $('preferred_level').value,
        budget: $('budget').value,
        created: new Date().toISOString()
      });
      save('cs_bookings', bookings);
      $('booking-result').innerHTML = '<h3>Booking Requested</h3><p>Thanks ' + name + '. Your booking request has been saved locally (simulated).</p>';
      show($('booking-result'));
      bookingForm.reset();
    });
  }

  // Student applications
  const stuForm = $('student-apply');
  if(stuForm){
    $('stu-submit').addEventListener('click', ()=>{
      const name = $('stu_name').value.trim();
      const email = $('stu_email').value.trim();
      if(!name || !email){ alert('Please provide name and email.'); return; }
      const apps = load('cs_student_apps', []);
      apps.push({
        id: 'stu-' + (apps.length+1),
        name, email,
        phone: $('stu_phone').value,
        school: $('stu_school').value,
        program: $('stu_program').value,
        statement: $('stu_statement').value,
        created: new Date().toISOString()
      });
      save('cs_student_apps', apps);
      $('stu-result').innerHTML = '<h3>Application Submitted</h3><p>Thank you, ' + name + '. Your application has been saved locally (simulated).</p>';
      show($('stu-result'));
      stuForm.reset();
    });
  }

  // Forum: topics & replies
  function renderThreads(){
    const container = $('threads');
    if(!container) return;
    const topics = load('cs_forum_topics', [
      {id:'t1', title:'Perfect sear on steak', author:'N. Molefe', message:'How do you get a consistent medium-rare? Tips?', created: new Date().toISOString(), replies:[
        {author:'M. Banda', text:'Use cast-iron and finish in oven. Rest well.', created: new Date().toISOString()}
      ]}
    ]);
    save('cs_forum_topics', topics);
    container.innerHTML = '';
    topics.forEach(topic=>{
      const art = document.createElement('article');
      art.className = 'thread card';
      art.innerHTML = `<h4>${topic.title}</h4>
        <p class="meta">by ${topic.author} · ${new Date(topic.created).toLocaleString()}</p>
        <p>${topic.message}</p>
        <div class="comments"></div>
        <form class="small-form reply-form">
          <label>Reply <textarea required></textarea></label>
          <label>Name <input></label>
          <button class="btn small" type="button">Reply</button>
        </form>`;
      const commentsDiv = art.querySelector('.comments');
      (topic.replies||[]).forEach(r=>{
        const c = document.createElement('div');
        c.className = 'comment';
        c.innerHTML = `<p class="meta">${r.author} · ${new Date(r.created).toLocaleString()}</p><p>${r.text}</p>`;
        commentsDiv.appendChild(c);
      });
      // reply handler
      const replyForm = art.querySelector('.reply-form');
      replyForm.querySelector('button').addEventListener('click', ()=>{
        const ta = replyForm.querySelector('textarea');
        const name = replyForm.querySelector('input').value || 'Anonymous';
        if(!ta.value.trim()){ alert('Reply cannot be empty'); return; }
        topic.replies = topic.replies || [];
        topic.replies.push({author: name, text: ta.value.trim(), created: new Date().toISOString()});
        save('cs_forum_topics', topics);
        renderThreads();
      });
      container.appendChild(art);
    });
  }
  renderThreads();

  const newTopic = $('new-topic');
  if(newTopic){
    $('topic-submit').addEventListener('click', ()=>{
      const title = $('topic-title').value.trim();
      const message = $('topic-message').value.trim();
      if(!title || !message){ alert('Please provide title and message.'); return; }
      const topics = load('cs_forum_topics', []);
      topics.unshift({id:'t'+(topics.length+1), title, author: $('topic-author').value || 'Anonymous', message, created: new Date().toISOString(), replies:[]});
      save('cs_forum_topics', topics);
      newTopic.reset();
      renderThreads();
    });
  }

  // Expose for debug (optional)
  window.ChefSphere = {
    load, save
  };

})();