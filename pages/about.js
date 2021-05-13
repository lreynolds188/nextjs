import Head from 'next/head'
import styles from '../styles/Main.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Luke Reynolds</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className={styles.main}>  
        <h1 className={styles.title}>About</h1>
        <div>
        <br />
         <p className={styles.description}>
            I am a Computer Scientist and the owner of <a href="https://automatedtechnicalsolutions.com">Automated Tech Solutions</a> a technical consulting firm based in Queensland, Australia.
            I currently still have one subject remaining to complete my degree and am the sole member of my business working to implement infrastructure and build the customer base.
          </p><br /><br />
          <p className={styles.description}>
            At the beginning of my career I worked as a computer technician for a range of different companies between 2012 and 2015.
            In 2016 I received a diploma of software development from Tafe Queensland. In 2018 and '19 I was employed by a large food 
            processing plant and responsible for developing business applications and supporting the production environment.
            In 2020 I was the project manager for a university based start-up with the goal of implementing a cloud based portal for QUT.
            In my last position as a project and operations manager I was responsible for supporting the production environment 
            and implementing an IoT automation system for the company's primary reactor.
          </p><br /><br />
          <p className={styles.description}>
            Upon completion of my degree I plan to have a solid foundation in a range of different development
            languages and techniques with a keen focus on cyber security, blockchain technology, and IoT automation devices. In addition to a
            basic foundation of mathematics, physics, business, psychology, and philosophy.
            My goal is to work toward advancing the functionality, affordability, and sustainability of futuristic technological applications.
          </p>
        </div>
      </main>
    </div>
  )
}
